import { randomUUID } from 'crypto'
import {
  OrderPaymentStatus,
  OrderStatus,
  PaymentRecordStatus,
  Prisma,
} from '@prisma/client'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import type { CreateCheckoutSessionInput } from './checkout.validation'
import { calculateShippingAud } from './shippingRules'
import { createSquareHostedPaymentLink, isSquareConfigured } from './squareClient'
import { awardLoyaltyForPaidOrderIfEligible } from './loyalty.service'
import { effectiveProductUnitPrice } from './wholesalePricing'
import type { PricingViewer } from './wholesalePricing'

async function loadPricingViewerForCheckout(userId: string | undefined): Promise<PricingViewer> {
  if (!userId) return null
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, wholesaleApprovalStatus: true, isActive: true },
  })
  if (!u?.isActive) return null
  return { role: u.role, wholesaleApprovalStatus: u.wholesaleApprovalStatus }
}

const PAYMENT_NOTE_PREFIX = 'BC_ORDER:'

export function paymentNoteForOrder(orderId: string) {
  return `${PAYMENT_NOTE_PREFIX}${orderId}`
}

export function parseOrderIdFromPaymentNote(note: string | null | undefined): string | null {
  if (!note) return null
  const escaped = PAYMENT_NOTE_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = note.match(new RegExp(`^${escaped}(.+)$`))
  return m?.[1] ?? null
}

export async function createCheckoutSession(params: {
  input: CreateCheckoutSessionInput
  userId?: string
}) {
  const { input, userId } = params

  if (!env.CHECKOUT_SUCCESS_REDIRECT_URL) {
    throw new ApiError({
      statusCode: 503,
      code: 'CHECKOUT_URL_NOT_CONFIGURED',
      message:
        'Checkout success URL is not configured. Set CHECKOUT_SUCCESS_REDIRECT_URL in the backend environment.',
    })
  }

  const grouped = new Map<string, number>()
  for (const line of input.cartItems) {
    grouped.set(line.productId, (grouped.get(line.productId) ?? 0) + line.quantity)
  }

  const productIds = [...grouped.keys()]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const pricingViewer = await loadPricingViewerForCheckout(userId)

  if (products.length !== productIds.length) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_PRODUCT',
      message: 'One or more products in your cart are not available.',
    })
  }

  let subtotalDec = new Prisma.Decimal(0)
  const linePrepared: {
    productId: string
    name: string
    slug: string
    unitPrice: Prisma.Decimal
    quantity: number
    lineTotal: Prisma.Decimal
  }[] = []

  for (const p of products) {
    if (!p.isActive) {
      throw new ApiError({
        statusCode: 400,
        code: 'INACTIVE_PRODUCT',
        message: `The product "${p.name}" is not available for purchase right now.`,
      })
    }
    const qty = grouped.get(p.id)!
    if (p.stockQuantity < qty) {
      throw new ApiError({
        statusCode: 400,
        code: 'INSUFFICIENT_STOCK',
        message: `Not enough stock for "${p.name}". Please reduce the quantity and try again.`,
      })
    }
    const unit = effectiveProductUnitPrice(
      { price: p.price, wholesalePrice: p.wholesalePrice },
      pricingViewer,
    )
    const lineTotal = unit.mul(qty)
    subtotalDec = subtotalDec.add(lineTotal)
    linePrepared.push({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      unitPrice: unit,
      quantity: qty,
      lineTotal,
    })
  }

  const shippingAud = calculateShippingAud(Number(subtotalDec))
  const shippingDec = new Prisma.Decimal(shippingAud.toFixed(2))
  const totalDec = subtotalDec.add(shippingDec)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: userId ?? null,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        suburb: input.suburb,
        state: input.state,
        postcode: input.postcode,
        country: input.country,
        notes: input.notes ?? null,
        subtotalAmount: subtotalDec,
        shippingAmount: shippingDec,
        totalAmount: totalDec,
        status: OrderStatus.AWAITING_PAYMENT,
        paymentStatus: OrderPaymentStatus.PENDING,
      },
    })

    await tx.orderItem.createMany({
      data: linePrepared.map((l) => ({
        orderId: created.id,
        productId: l.productId,
        productNameSnapshot: l.name,
        productSlugSnapshot: l.slug,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
    })

    await tx.orderPayment.create({
      data: {
        orderId: created.id,
        provider: 'SQUARE',
        status: PaymentRecordStatus.PENDING,
        amount: totalDec,
      },
    })

    return created
  })

  const successUrl = new URL(env.CHECKOUT_SUCCESS_REDIRECT_URL)
  successUrl.searchParams.set('orderId', order.id)

  const paymentNote = paymentNoteForOrder(order.id)

  /**
   * Local / class demo: when Square is not configured, skip hosted checkout and send the buyer
   * straight to the success page with the order marked PAID. Never runs in production.
   */
  if (!isSquareConfigured() && env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[checkout] Square not configured — using DEMO checkout (order marked paid). Add SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID for real payments.',
    )
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: OrderPaymentStatus.PAID,
        },
      })
      await tx.orderPayment.updateMany({
        where: { orderId: order.id },
        data: {
          status: PaymentRecordStatus.PAID,
          provider: 'DEMO',
          providerReference: 'demo-local-checkout',
        },
      })
    })
    await awardLoyaltyForPaidOrderIfEligible(order.id)
    return {
      orderId: order.id,
      checkoutUrl: successUrl.toString(),
      demoCheckout: true as const,
      status: {
        orderStatus: OrderStatus.PAID,
        paymentStatus: OrderPaymentStatus.PAID,
      },
      totals: {
        subtotalAud: subtotalDec.toFixed(2),
        shippingAud: shippingDec.toFixed(2),
        totalAud: totalDec.toFixed(2),
      },
    }
  }

  try {
    const square = await createSquareHostedPaymentLink({
      idempotencyKey: randomUUID(),
      quickPayName: `By Celeste order ${order.id.slice(0, 8)}`,
      totalAud: Number(totalDec.toFixed(2)),
      redirectUrlAfterPayment: successUrl.toString(),
      paymentNote,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        squarePaymentLinkId: square.paymentLinkId,
        squareOrderId: square.squareOrderId ?? null,
      },
    })

    return {
      orderId: order.id,
      checkoutUrl: square.checkoutUrl,
      status: {
        orderStatus: OrderStatus.AWAITING_PAYMENT,
        paymentStatus: OrderPaymentStatus.PENDING,
      },
      totals: {
        subtotalAud: subtotalDec.toFixed(2),
        shippingAud: shippingDec.toFixed(2),
        totalAud: totalDec.toFixed(2),
      },
    }
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAYMENT_FAILED,
        paymentStatus: OrderPaymentStatus.FAILED,
      },
    })
    await prisma.orderPayment.updateMany({
      where: { orderId: order.id, provider: 'SQUARE' },
      data: { status: PaymentRecordStatus.FAILED },
    })
    throw err
  }
}

export async function getPublicOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      updatedAt: true,
    },
  })

  if (!order) {
    throw new ApiError({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
      message: 'We could not find that order.',
    })
  }

  return {
    orderId: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount.toFixed(2),
    currency: 'AUD' as const,
    updatedAt: order.updatedAt.toISOString(),
  }
}
