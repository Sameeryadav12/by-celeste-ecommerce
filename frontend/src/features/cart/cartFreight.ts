import { SHIPPING_CONFIG, calculateShipping } from './shippingRules'
import { formatAud } from './money'

/** Australian postcode: exactly 4 digits (0–9999). */
export function isValidAuPostcode(value: string): boolean {
  return /^\d{4}$/.test(value.trim())
}

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= SHIPPING_CONFIG.freeShippingThreshold
}

/** Shipping amount once “resolved” for display/checkout alignment (same as server rule). */
export function standardShippingAmount(subtotal: number): number {
  return calculateShipping(subtotal)
}

export function formatShippingToPostcodeLine(postcode: string, subtotal: number): string {
  const fee = standardShippingAmount(subtotal)
  if (fee === 0) {
    return `Shipping to ${postcode}: Free`
  }
  return `Shipping to ${postcode}: ${formatAud(fee)}`
}
