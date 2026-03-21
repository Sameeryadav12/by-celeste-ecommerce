import {
  OrderPaymentStatus,
  OrderStatus,
  PaymentRecordStatus,
  Prisma,
} from '@prisma/client'
import { WebhooksHelper } from 'square'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { parseOrderIdFromPaymentNote } from './checkout.service'
import { awardLoyaltyForPaidOrderIfEligible } from './loyalty.service'

type SquareWebhookPayload = {
  event_id?: string
  type?: string
  data?: {
    type?: string
    id?: string
    object?: {
      payment?: SquarePaymentShape
    }
  }
}

type SquarePaymentShape = {
  id?: string
  status?: string
  note?: string
  order_id?: string
  amount_money?: { amount?: number; currency?: string }
}

function mapSquarePaymentToRecordStatus(
  squareStatus: string | undefined,
): PaymentRecordStatus | null {
  const s = squareStatus?.toUpperCase()
  if (s === 'COMPLETED' || s === 'APPROVED') return PaymentRecordStatus.PAID
  if (s === 'FAILED') return PaymentRecordStatus.FAILED
  if (s === 'CANCELED' || s === 'CANCELLED') return PaymentRecordStatus.CANCELLED
  if (s === 'PENDING') return PaymentRecordStatus.PENDING
  return null
}

function mapOrderPaymentStatusFromSquare(squareStatus: string | undefined): OrderPaymentStatus | null {
  const s = squareStatus?.toUpperCase()
  if (s === 'COMPLETED' || s === 'APPROVED') return OrderPaymentStatus.PAID
  if (s === 'FAILED') return OrderPaymentStatus.FAILED
  if (s === 'CANCELED' || s === 'CANCELLED') return OrderPaymentStatus.CANCELLED
  if (s === 'PENDING') return OrderPaymentStatus.PENDING
  return null
}

function mapOrderStatusFromSquare(squareStatus: string | undefined): OrderStatus | null {
  const s = squareStatus?.toUpperCase()
  if (s === 'COMPLETED' || s === 'APPROVED') return OrderStatus.PAID
  if (s === 'FAILED') return OrderStatus.PAYMENT_FAILED
  if (s === 'CANCELED' || s === 'CANCELLED') return OrderStatus.CANCELLED
  return null
}

/**
 * Returns HTTP status to send back to Square. Square retries on non-2xx; use 200 when the event
 * was handled or safely ignored so retries stop.
 */
export async function processSquareWebhookRequest(params: {
  rawBody: string
  signatureHeader: string | undefined
}): Promise<number> {
  const key = env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const notificationUrl = env.SQUARE_WEBHOOK_NOTIFICATION_URL

  if (!key || !notificationUrl) {
    console.warn(
      '[square webhook] Missing SQUARE_WEBHOOK_SIGNATURE_KEY or SQUARE_WEBHOOK_NOTIFICATION_URL — refusing webhook.',
    )
    return 503
  }

  const okSig = await WebhooksHelper.verifySignature({
    requestBody: params.rawBody,
    signatureHeader: params.signatureHeader ?? '',
    signatureKey: key,
    notificationUrl,
  })

  if (!okSig) {
    console.warn('[square webhook] Invalid signature (check notification URL matches dashboard exactly).')
    return 403
  }

  let payload: SquareWebhookPayload
  try {
    payload = JSON.parse(params.rawBody) as SquareWebhookPayload
  } catch {
    return 400
  }

  const eventId = payload.event_id
  if (!eventId) {
    return 200
  }

  try {
    await prisma.processedSquareWebhookEvent.create({
      data: { eventId },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return 200
    }
    throw e
  }

  if (payload.type !== 'payment.updated') {
    return 200
  }

  const payment = payload.data?.object?.payment
  if (!payment?.id) {
    return 200
  }

  let orderId = parseOrderIdFromPaymentNote(
    typeof payment.note === 'string' ? payment.note : undefined,
  )

  if (!orderId && typeof payment.order_id === 'string') {
    const match = await prisma.order.findFirst({
      where: { squareOrderId: payment.order_id },
      select: { id: true },
    })
    orderId = match?.id ?? null
  }

  if (!orderId) {
    return 200
  }

  const orderPaymentStatus = mapOrderPaymentStatusFromSquare(payment.status)
  const orderStatus = mapOrderStatusFromSquare(payment.status)
  const recordStatus = mapSquarePaymentToRecordStatus(payment.status)

  const paymentRow = await prisma.orderPayment.findFirst({
    where: { orderId, provider: 'SQUARE' },
    orderBy: { createdAt: 'desc' },
  })

  if (paymentRow) {
    await prisma.orderPayment.update({
      where: { id: paymentRow.id },
      data: {
        providerReference: payment.id,
        ...(recordStatus ? { status: recordStatus } : {}),
        rawPayload: payload as object,
      },
    })
  }

  if (orderPaymentStatus && orderStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: orderPaymentStatus,
        status: orderStatus,
      },
    })

    if (orderStatus === OrderStatus.PAID && orderPaymentStatus === OrderPaymentStatus.PAID) {
      await awardLoyaltyForPaidOrderIfEligible(orderId)
    }
  }

  return 200
}
