/**
 * Step 6 demo shipping rules (AUD).
 * Replace with real carrier/service rules in a later step.
 */
export const SHIPPING_CONFIG = {
  standardFee: 9.95,
  freeShippingThreshold: 120,
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0
  if (subtotal >= SHIPPING_CONFIG.freeShippingThreshold) return 0
  return SHIPPING_CONFIG.standardFee
}

