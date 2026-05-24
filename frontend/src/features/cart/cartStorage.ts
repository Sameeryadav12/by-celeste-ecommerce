import type { CartItem } from './cartTypes'

const STORAGE_KEY = 'by_celeste_cart_v1'
const META_KEY = 'by_celeste_cart_meta_v1'

export type CartPricingMode = 'retail' | 'wholesale'

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => item as CartItem)
      .filter(
        (item) =>
          typeof item.productId === 'string' &&
          typeof item.slug === 'string' &&
          typeof item.name === 'string' &&
          typeof item.imageUrl === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          typeof item.stockQuantity === 'number',
      )
  } catch {
    return []
  }
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function loadCartPricingMode(): CartPricingMode | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(META_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { pricingMode?: CartPricingMode }
    return parsed.pricingMode === 'wholesale' || parsed.pricingMode === 'retail'
      ? parsed.pricingMode
      : null
  } catch {
    return null
  }
}

export function saveCartPricingMode(mode: CartPricingMode) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(META_KEY, JSON.stringify({ pricingMode: mode }))
}
