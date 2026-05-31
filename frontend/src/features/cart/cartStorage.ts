import type { CartItem } from './cartTypes'

const GUEST_CART_KEY = 'byceleste_cart_guest'
const GUEST_META_KEY = 'byceleste_cart_meta_guest'
const GUEST_COUPON_KEY = 'byceleste_coupon_guest'

const USER_CART_PREFIX = 'byceleste_cart_user_'
const USER_META_PREFIX = 'byceleste_cart_meta_user_'
const USER_COUPON_PREFIX = 'byceleste_coupon_user_'

/** Legacy keys from earlier builds; cleared after the per-user keys land so old data does not leak across accounts. */
const LEGACY_KEYS = [
  'by_celeste_cart_v1',
  'by_celeste_cart_meta_v1',
  'by_celeste_cart_coupon_v1',
] as const

export type CartPricingMode = 'retail' | 'wholesale'

export type StoredCoupon = {
  code: string
  percentage: number
}

/** Stable scope key tied to the current auth user; falls back to a single guest bucket. */
export type CartScope = {
  /** Stable user id (preferred) or sanitised email; `null` means guest. */
  key: string | null
}

export const GUEST_SCOPE: CartScope = { key: null }

function sanitise(part: string): string {
  return part.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
}

export function scopeForUser(input: { id?: string | null; email?: string | null } | null | undefined): CartScope {
  if (!input) return GUEST_SCOPE
  const id = typeof input.id === 'string' ? input.id.trim() : ''
  if (id) return { key: sanitise(id) }
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  if (email) return { key: sanitise(`email_${email}`) }
  return GUEST_SCOPE
}

function cartKey(scope: CartScope): string {
  return scope.key ? `${USER_CART_PREFIX}${scope.key}` : GUEST_CART_KEY
}

function metaKey(scope: CartScope): string {
  return scope.key ? `${USER_META_PREFIX}${scope.key}` : GUEST_META_KEY
}

function couponKey(scope: CartScope): string {
  return scope.key ? `${USER_COUPON_PREFIX}${scope.key}` : GUEST_COUPON_KEY
}

export const STORAGE_KEY_PREFIXES = {
  cart: [USER_CART_PREFIX, GUEST_CART_KEY] as const,
  meta: [USER_META_PREFIX, GUEST_META_KEY] as const,
  coupon: [USER_COUPON_PREFIX, GUEST_COUPON_KEY] as const,
}

export function isCartStorageKey(key: string): boolean {
  return (
    key.startsWith(USER_CART_PREFIX) ||
    key.startsWith(USER_META_PREFIX) ||
    key.startsWith(USER_COUPON_PREFIX) ||
    key === GUEST_CART_KEY ||
    key === GUEST_META_KEY ||
    key === GUEST_COUPON_KEY
  )
}

export function clearLegacyCartStorage(): void {
  if (typeof window === 'undefined') return
  for (const key of LEGACY_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore quota / privacy errors
    }
  }
}

export function loadCartFromStorage(scope: CartScope = GUEST_SCOPE): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(cartKey(scope))
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

export function saveCartToStorage(items: CartItem[], scope: CartScope = GUEST_SCOPE) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(cartKey(scope), JSON.stringify(items))
}

export function loadCartPricingMode(scope: CartScope = GUEST_SCOPE): CartPricingMode | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(metaKey(scope))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { pricingMode?: CartPricingMode }
    return parsed.pricingMode === 'wholesale' || parsed.pricingMode === 'retail'
      ? parsed.pricingMode
      : null
  } catch {
    return null
  }
}

export function saveCartPricingMode(mode: CartPricingMode, scope: CartScope = GUEST_SCOPE) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(metaKey(scope), JSON.stringify({ pricingMode: mode }))
}

export function loadStoredCoupon(scope: CartScope = GUEST_SCOPE): StoredCoupon | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(couponKey(scope))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredCoupon>
    if (
      parsed &&
      typeof parsed.code === 'string' &&
      typeof parsed.percentage === 'number' &&
      parsed.percentage > 0 &&
      parsed.percentage <= 100
    ) {
      return { code: parsed.code.toUpperCase(), percentage: parsed.percentage }
    }
    return null
  } catch {
    return null
  }
}

export function saveStoredCoupon(coupon: StoredCoupon | null, scope: CartScope = GUEST_SCOPE) {
  if (typeof window === 'undefined') return
  const key = couponKey(scope)
  if (!coupon) {
    window.localStorage.removeItem(key)
    return
  }
  window.localStorage.setItem(key, JSON.stringify(coupon))
}

/** Removes the active cart, meta, and coupon for this scope (used on logout for the user scope). */
export function clearScopeStorage(scope: CartScope): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(cartKey(scope))
    window.localStorage.removeItem(metaKey(scope))
    window.localStorage.removeItem(couponKey(scope))
  } catch {
    // ignore
  }
}
