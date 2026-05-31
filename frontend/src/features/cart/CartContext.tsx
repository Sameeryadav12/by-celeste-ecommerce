import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  GUEST_SCOPE,
  clearLegacyCartStorage,
  isCartStorageKey,
  loadCartFromStorage,
  loadCartPricingMode,
  loadStoredCoupon,
  saveCartPricingMode,
  saveCartToStorage,
  saveStoredCoupon,
  scopeForUser,
  type CartPricingMode,
  type CartScope,
  type StoredCoupon,
} from './cartStorage'
import type { CartItem, CartSummary } from './cartTypes'

type AddToCartInput = Omit<CartItem, 'quantity'> & {
  quantity?: number
  /** When adding from wholesale portal, tag cart for wholesale checkout pricing. */
  pricingMode?: CartPricingMode
}

type AddItemResult = { added: boolean; message: string }

type CartContextValue = {
  items: CartItem[]
  summary: CartSummary
  pricingMode: CartPricingMode | null
  cartBumpVersion: number
  coupon: StoredCoupon | null
  addItem: (input: AddToCartInput) => AddItemResult
  addManyItems: (inputs: AddToCartInput[]) => { addedCount: number; errors: string[] }
  incrementItem: (productId: string) => void
  decrementItem: (productId: string) => void
  setItemQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setCoupon: (coupon: StoredCoupon | null) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function clampQuantity(quantity: number, stockQuantity: number) {
  const max = stockQuantity > 0 ? stockQuantity : 1
  if (quantity < 1) return 1
  if (quantity > max) return max
  return quantity
}

function applyAddToList(prev: CartItem[], input: AddToCartInput): { next: CartItem[]; result: AddItemResult } {
  if (input.stockQuantity <= 0) {
    return { next: prev, result: { added: false, message: 'This product is currently out of stock.' } }
  }

  const quantityToAdd = clampQuantity(input.quantity ?? 1, input.stockQuantity)
  const existing = prev.find((item) => item.productId === input.productId)
  const lineFields = {
    productId: input.productId,
    slug: input.slug,
    name: input.name,
    imageUrl: input.imageUrl,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    stockQuantity: input.stockQuantity,
    categoryName: input.categoryName,
    shortDescription: input.shortDescription,
  }

  if (!existing) {
    return {
      next: [...prev, { ...lineFields, quantity: quantityToAdd }],
      result: { added: true, message: 'Added to cart ✓' },
    }
  }

  const newQuantity = clampQuantity(existing.quantity + quantityToAdd, existing.stockQuantity)
  if (newQuantity === existing.quantity) {
    return {
      next: prev,
      result: {
        added: false,
        message: `You already have the maximum available quantity for ${existing.name}.`,
      },
    }
  }

  const next = prev.map((item) =>
    item.productId === input.productId
      ? { ...item, ...lineFields, quantity: newQuantity }
      : item,
  )
  return { next, result: { added: true, message: 'Added to cart ✓' } }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth()

  /** Auth might be loading: keep cart isolated to the guest bucket until we know who the user is. */
  const isAuthResolved = status === 'authenticated' || status === 'unauthenticated'
  const scope: CartScope = useMemo(
    () => (isAuthResolved ? scopeForUser(user) : GUEST_SCOPE),
    [isAuthResolved, user],
  )

  // One-time cleanup of pre-isolation legacy storage so old data does not leak between accounts.
  useEffect(() => {
    clearLegacyCartStorage()
  }, [])

  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage(GUEST_SCOPE))
  const [pricingMode, setPricingMode] = useState<CartPricingMode | null>(() =>
    loadCartPricingMode(GUEST_SCOPE),
  )
  const [coupon, setCouponState] = useState<StoredCoupon | null>(() => loadStoredCoupon(GUEST_SCOPE))
  const [cartBumpVersion, setCartBumpVersion] = useState(0)

  const scopeRef = useRef<CartScope>(scope)
  scopeRef.current = scope

  /** Reload cart + coupon when the active scope changes (login, logout, switch user). */
  useEffect(() => {
    setItems(loadCartFromStorage(scope))
    setPricingMode(loadCartPricingMode(scope))
    setCouponState(loadStoredCoupon(scope))
  }, [scope])

  /** Cross-tab sync: when another tab writes to this scope's keys, reload state. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    function onStorage(event: StorageEvent) {
      if (!event.key) {
        // The whole storage was cleared (logout in another tab) — reload current scope.
        const current = scopeRef.current
        setItems(loadCartFromStorage(current))
        setPricingMode(loadCartPricingMode(current))
        setCouponState(loadStoredCoupon(current))
        return
      }
      if (!isCartStorageKey(event.key)) return
      const current = scopeRef.current
      setItems(loadCartFromStorage(current))
      setPricingMode(loadCartPricingMode(current))
      setCouponState(loadStoredCoupon(current))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: CartItem[], mode?: CartPricingMode) => {
    setItems(next)
    saveCartToStorage(next, scopeRef.current)
    if (mode) {
      setPricingMode(mode)
      saveCartPricingMode(mode, scopeRef.current)
    }
  }, [])

  const addItem = useCallback((input: AddToCartInput): AddItemResult => {
    let result: AddItemResult = { added: false, message: 'Could not add to cart.' }

    setItems((prev) => {
      const { next, result: r } = applyAddToList(prev, input)
      result = r
      saveCartToStorage(next, scopeRef.current)
      if (input.pricingMode) {
        setPricingMode(input.pricingMode)
        saveCartPricingMode(input.pricingMode, scopeRef.current)
      }
      return next
    })

    if (result.added) {
      setCartBumpVersion((v) => v + 1)
    }
    return result
  }, [])

  const addManyItems = useCallback((inputs: AddToCartInput[]) => {
    const errors: string[] = []
    let addedCount = 0

    setItems((prev) => {
      let next = prev
      for (const input of inputs) {
        const { next: updated, result } = applyAddToList(next, input)
        next = updated
        if (result.added) addedCount += 1
        else errors.push(`${input.name}: ${result.message}`)
      }
      saveCartToStorage(next, scopeRef.current)
      const mode = inputs.find((i) => i.pricingMode)?.pricingMode
      if (mode) {
        setPricingMode(mode)
        saveCartPricingMode(mode, scopeRef.current)
      }
      return next
    })

    if (addedCount > 0) {
      setCartBumpVersion((v) => v + 1)
    }

    return { addedCount, errors }
  }, [])

  const incrementItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stockQuantity) }
          : item,
      )
      saveCartToStorage(next, scopeRef.current)
      return next
    })
  }, [])

  const decrementItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: clampQuantity(item.quantity - 1, item.stockQuantity) }
          : item,
      )
      saveCartToStorage(next, scopeRef.current)
      return next
    })
  }, [])

  const setItemQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: clampQuantity(Math.floor(quantity), item.stockQuantity) }
          : item,
      )
      saveCartToStorage(next, scopeRef.current)
      return next
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.productId !== productId)
      saveCartToStorage(next, scopeRef.current)
      return next
    })
  }, [])

  const setCoupon = useCallback((next: StoredCoupon | null) => {
    setCouponState(next)
    saveStoredCoupon(next, scopeRef.current)
  }, [])

  const clearCart = useCallback(() => {
    persist([])
    setCouponState(null)
    saveStoredCoupon(null, scopeRef.current)
  }, [persist])

  const summary = useMemo<CartSummary>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { itemCount, subtotal }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      summary,
      pricingMode,
      cartBumpVersion,
      coupon,
      addItem,
      addManyItems,
      incrementItem,
      decrementItem,
      setItemQuantity,
      removeItem,
      clearCart,
      setCoupon,
    }),
    [
      items,
      summary,
      pricingMode,
      cartBumpVersion,
      coupon,
      addItem,
      addManyItems,
      incrementItem,
      decrementItem,
      setItemQuantity,
      removeItem,
      clearCart,
      setCoupon,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
