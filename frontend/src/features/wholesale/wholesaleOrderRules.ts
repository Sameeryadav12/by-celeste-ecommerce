export const WHOLESALE_MINIMUM_ORDER_AUD = 300

export const WHOLESALE_MINIMUM_ORDER_MESSAGE =
  'Wholesale orders must be at least $300 before shipping.'

export const WHOLESALE_MINIMUM_ORDER_SUMMARY =
  'Wholesale minimum order is $300 before shipping.'

export type WholesaleMinimumStatus = {
  applies: boolean
  meetsMinimum: boolean
  productSubtotal: number
  remaining: number
}

function roundAud(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** Uses product subtotal before shipping and before coupon discounts. */
export function evaluateWholesaleMinimum(params: {
  isApprovedWholesale: boolean
  productSubtotal: number
}): WholesaleMinimumStatus {
  const productSubtotal = roundAud(params.productSubtotal)
  if (!params.isApprovedWholesale) {
    return { applies: false, meetsMinimum: true, productSubtotal, remaining: 0 }
  }
  const meetsMinimum = productSubtotal >= WHOLESALE_MINIMUM_ORDER_AUD
  const remaining = meetsMinimum
    ? 0
    : roundAud(WHOLESALE_MINIMUM_ORDER_AUD - productSubtotal)
  return { applies: true, meetsMinimum, productSubtotal, remaining }
}

export function wholesaleMinimumStatusMessage(status: WholesaleMinimumStatus): string {
  if (!status.applies) return ''
  if (status.meetsMinimum) return 'Wholesale minimum reached.'
  return `Add $${status.remaining.toFixed(2)} more to reach the wholesale minimum.`
}
