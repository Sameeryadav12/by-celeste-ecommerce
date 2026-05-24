import { env } from '../config/env'
import { ApiError } from '../utils/apiError'

function getSquareBaseUrl(): string {
  return env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'
}

export type CreatePaymentLinkResult = {
  checkoutUrl: string
  paymentLinkId: string
  squareOrderId?: string
}

export const SQUARE_CHECKOUT_UNAVAILABLE_MESSAGE =
  'Online payment is not connected yet. Please contact By Celeste.'

/** True when Square sandbox/production credentials are set (real hosted checkout). */
export function isSquareConfigured(): boolean {
  return Boolean(env.SQUARE_ACCESS_TOKEN?.trim() && env.SQUARE_LOCATION_ID?.trim())
}

/** Webhook verification (production go-live). */
export function isSquareWebhookConfigured(): boolean {
  return Boolean(
    env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() && env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim(),
  )
}

export function getSquareSetupStatus() {
  return {
    checkoutReady: isSquareConfigured(),
    webhookReady: isSquareWebhookConfigured(),
    environment: env.SQUARE_ENVIRONMENT,
    missingForCheckout: [
      !env.SQUARE_ACCESS_TOKEN?.trim() ? 'SQUARE_ACCESS_TOKEN' : null,
      !env.SQUARE_LOCATION_ID?.trim() ? 'SQUARE_LOCATION_ID' : null,
    ].filter(Boolean) as string[],
    missingForWebhooks: [
      !env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() ? 'SQUARE_WEBHOOK_SIGNATURE_KEY' : null,
      !env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() ? 'SQUARE_WEBHOOK_NOTIFICATION_URL' : null,
    ].filter(Boolean) as string[],
  }
}

/**
 * Small REST wrapper for Square Online Checkout payment links (hosted checkout).
 * Keeps HTTP details in one place so the rest of the app stays readable.
 */
export async function createSquareHostedPaymentLink(params: {
  idempotencyKey: string
  /** Shown on the Square checkout / order as the line name */
  quickPayName: string
  /** Total in major units (e.g. AUD dollars) */
  totalAud: number
  redirectUrlAfterPayment: string
  /** Copied onto the Square Payment as a note — used to match webhooks to our order. */
  paymentNote: string
}): Promise<CreatePaymentLinkResult> {
  if (!isSquareConfigured()) {
    throw new ApiError({
      statusCode: 503,
      code: 'SQUARE_NOT_CONFIGURED',
      message: SQUARE_CHECKOUT_UNAVAILABLE_MESSAGE,
    })
  }

  const token = env.SQUARE_ACCESS_TOKEN!
  const locationId = env.SQUARE_LOCATION_ID!

  const amountCents = Math.round(params.totalAud * 100)
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_TOTAL',
      message: 'Order total is too small to charge.',
    })
  }

  const body = {
    idempotency_key: params.idempotencyKey,
    description: 'By Celeste checkout',
    quick_pay: {
      name: params.quickPayName.slice(0, 255),
      price_money: {
        amount: amountCents,
        currency: 'AUD',
      },
      location_id: locationId,
    },
    checkout_options: {
      redirect_url: params.redirectUrlAfterPayment,
    },
    payment_note: params.paymentNote.slice(0, 500),
  }

  const res = await fetch(`${getSquareBaseUrl()}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Square-Version': env.SQUARE_API_VERSION,
    },
    body: JSON.stringify(body),
  })

  const json = (await res.json()) as {
    errors?: { code?: string; detail?: string; category?: string }[]
    payment_link?: { id?: string; url?: string }
    related_resources?: { orders?: { id?: string }[] }
  }

  if (!res.ok || json.errors?.length) {
    const detail = json.errors?.map((e) => e.detail || e.code).filter(Boolean).join(' — ')
    throw new ApiError({
      statusCode: 502,
      code: 'SQUARE_CHECKOUT_FAILED',
      message: detail || 'Square could not start checkout. Please try again in a moment.',
      details: json.errors,
    })
  }

  const url = json.payment_link?.url
  const paymentLinkId = json.payment_link?.id
  if (!url || !paymentLinkId) {
    throw new ApiError({
      statusCode: 502,
      code: 'SQUARE_CHECKOUT_INVALID_RESPONSE',
      message: 'Square returned an unexpected response when creating checkout.',
    })
  }

  const squareOrderId = json.related_resources?.orders?.[0]?.id

  return {
    checkoutUrl: url,
    paymentLinkId,
    squareOrderId,
  }
}
