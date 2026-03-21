export type CatalogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export type CatalogIngredient = {
  id: string
  name: string
  slug: string
  description: string
  benefits: string | null
}

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  howToUse: string
  /** Curated marketing benefits extracted from `docs/04-products.md`. */
  benefits: string[]
  /** Unit price for the current viewer (retail or approved wholesale). */
  price: number
  /** Present when approved wholesale pricing applies — public retail unit for reference. */
  retailUnitPrice?: number
  isWholesalePrice: boolean
  compareAtPrice: number | null
  imageUrl: string
  isFeatured: boolean
  stockQuantity: number
  categories: CatalogCategory[]
  ingredients: CatalogIngredient[]
}

export type CatalogPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type CatalogProductsResult = {
  products: CatalogProduct[]
  pagination: CatalogPagination
}

export type ProductSort = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

