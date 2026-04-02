export type CartItem = {
  productId: string
  slug: string
  name: string
  imageUrl: string
  price: number
  compareAtPrice: number | null
  quantity: number
  stockQuantity: number
  /** First category name — shown as supporting detail in the cart. */
  categoryName?: string
  /** Truncated product description — shown beneath the name in cart. */
  shortDescription?: string
}

export type CartSummary = {
  subtotal: number
  itemCount: number
}

