/**
 * Step 7 — backend shipping (AUD). Must stay aligned with `frontend/src/features/cart/shippingRules.ts`.
 * Later this can be replaced by Australia Post / Sendle or carrier APIs; the backend remains the
 * source of truth for checkout totals.
 */
export const SHIPPING_CONFIG = {
  standardFee: 9.95,
  freeShippingThreshold: 120,
} as const

export function calculateShippingAud(subtotal: number): number {
  if (subtotal <= 0) return 0
  if (subtotal >= SHIPPING_CONFIG.freeShippingThreshold) return 0
  return SHIPPING_CONFIG.standardFee
}
