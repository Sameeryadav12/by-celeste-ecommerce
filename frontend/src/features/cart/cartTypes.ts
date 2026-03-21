export type CartItem = {
  productId: string
  slug: string
  name: string
  imageUrl: string
  price: number
  compareAtPrice: number | null
  quantity: number
  stockQuantity: number
}

export type CartSummary = {
  subtotal: number
  itemCount: number
}

