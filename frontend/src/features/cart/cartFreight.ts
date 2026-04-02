import { SHIPPING_CONFIG, calculateShipping } from './shippingRules'
import { formatAud } from './money'

/** Australian postcode: exactly 4 digits (0–9999). */
export function isValidAuPostcode(value: string): boolean {
  return /^\d{4}$/.test(value.trim())
}

/** Shipping amount once “resolved” for display/checkout alignment (same as server rule). */
export function standardShippingAmount(subtotal: number): number {
  return calculateShipping(subtotal)
}

export function formatShippingToPostcodeLine(postcode: string, subtotal: number): string {
  const fee = standardShippingAmount(subtotal)
  return `Shipping to ${postcode}: ${formatAud(fee)} via ${SHIPPING_CONFIG.carrierLabel}`
}
