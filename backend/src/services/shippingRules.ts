/** Flat-rate shipping (AUD), no discounts. */
export const SHIPPING_CONFIG = {
  standardFee: 12,
  carrierLabel: 'Australia Post',
} as const

export function calculateShippingAud(subtotal: number): number {
  if (subtotal <= 0) return 0
  return SHIPPING_CONFIG.standardFee
}
