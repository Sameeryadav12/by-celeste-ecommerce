import type { CartItem } from './cartTypes'

const STORAGE_KEY = 'by_celeste_cart_v1'

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

