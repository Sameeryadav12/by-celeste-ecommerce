import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadCartFromStorage, saveCartToStorage } from './cartStorage'
import type { CartItem, CartSummary } from './cartTypes'

type AddToCartInput = Omit<CartItem, 'quantity'> & { quantity?: number }

type CartContextValue = {
  items: CartItem[]
  summary: CartSummary
  /** Increments on each successful `addItem` — use to flash cart UI in the header. */
  cartBumpVersion: number
  addItem: (input: AddToCartInput) => { added: boolean; message: string }
  incrementItem: (productId: string) => void
  decrementItem: (productId: string) => void
  setItemQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function clampQuantity(quantity: number, stockQuantity: number) {
  const max = stockQuantity > 0 ? stockQuantity : 1
  if (quantity < 1) return 1
  if (quantity > max) return max
  return quantity
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())
  const [cartBumpVersion, setCartBumpVersion] = useState(0)

  function persist(next: CartItem[]) {
    setItems(next)
    saveCartToStorage(next)
  }

  function addItem(input: AddToCartInput) {
    if (input.stockQuantity <= 0) {
      return { added: false, message: 'This product is currently out of stock.' }
    }

    const quantityToAdd = clampQuantity(input.quantity ?? 1, input.stockQuantity)
    const existing = items.find((item) => item.productId === input.productId)

    if (!existing) {
      const next = [
        ...items,
        {
          ...input,
          quantity: quantityToAdd,
        },
      ]
      persist(next)
      setCartBumpVersion((v) => v + 1)
      return { added: true, message: 'Added to cart ✓' }
    }

    const newQuantity = clampQuantity(existing.quantity + quantityToAdd, existing.stockQuantity)
    if (newQuantity === existing.quantity) {
      return {
        added: false,
        message: `You already have the maximum available quantity for ${existing.name}.`,
      }
    }

    const next = items.map((item) =>
      item.productId === input.productId ? { ...item, quantity: newQuantity } : item,
    )
    persist(next)
    setCartBumpVersion((v) => v + 1)
    return { added: true, message: 'Added to cart ✓' }
  }

  function incrementItem(productId: string) {
    const next = items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stockQuantity) }
        : item,
    )
    persist(next)
  }

  function decrementItem(productId: string) {
    const next = items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: clampQuantity(item.quantity - 1, item.stockQuantity) }
        : item,
    )
    persist(next)
  }

  function setItemQuantity(productId: string, quantity: number) {
    const next = items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: clampQuantity(Math.floor(quantity), item.stockQuantity) }
        : item,
    )
    persist(next)
  }

  function removeItem(productId: string) {
    persist(items.filter((item) => item.productId !== productId))
  }

  function clearCart() {
    persist([])
  }

  const summary = useMemo<CartSummary>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { itemCount, subtotal }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      summary,
      cartBumpVersion,
      addItem,
      incrementItem,
      decrementItem,
      setItemQuantity,
      removeItem,
      clearCart,
    }),
    [items, summary, cartBumpVersion],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

