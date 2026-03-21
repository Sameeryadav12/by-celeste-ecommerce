import { apiFetch } from '../../lib/api'
import { mapCategory, mapPagination, mapProduct } from './catalogMappers'
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductsResult,
  ProductSort,
} from './catalogTypes'

type ApiListProductsResponse = {
  products: Array<{
    id: string
    name: string
    slug: string
    shortDescription: string
    description: string
    howToUse: string
    benefits: string[]
    price: string
    retailUnitPrice?: string
    isWholesalePrice?: boolean
    compareAtPrice: string | null
    imageUrl: string
    isFeatured: boolean
    stockQuantity: number
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type ApiProductDetailResponse = {
  product: {
    id: string
    name: string
    slug: string
    shortDescription: string
    description: string
    howToUse: string
    benefits: string[]
    price: string
    retailUnitPrice?: string
    isWholesalePrice?: boolean
    compareAtPrice: string | null
    imageUrl: string
    isFeatured: boolean
    stockQuantity: number
    categories: Array<{
      id: string
      name: string
      slug: string
      description: string | null
      isActive: boolean
    }>
    ingredients: Array<{
      id: string
      name: string
      slug: string
      description: string
      benefits: string | null
    }>
  }
}

type ApiCategoriesResponse = {
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    isActive: boolean
  }>
}

export type GetProductsQuery = {
  page?: number
  limit?: number
  category?: string
  search?: string
  featured?: boolean
  sort?: ProductSort
}

export async function getProducts(
  query: GetProductsQuery = {},
  signal?: AbortSignal,
): Promise<CatalogProductsResult> {
  const params = new URLSearchParams()

  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.category) params.set('category', query.category)
  if (query.search) params.set('search', query.search)
  if (query.featured) params.set('featured', 'true')
  if (query.sort) params.set('sort', query.sort)

  const suffix = params.toString() ? `?${params.toString()}` : ''
  const data = await apiFetch<ApiListProductsResponse>(`/api/products${suffix}`, { signal })

  return {
    products: data.products.map(mapProduct),
    pagination: mapPagination(data.pagination),
  }
}

export async function getProductBySlug(slug: string, signal?: AbortSignal): Promise<CatalogProduct> {
  const data = await apiFetch<ApiProductDetailResponse>(`/api/products/${encodeURIComponent(slug)}`, {
    signal,
  })
  return mapProduct(data.product)
}

export async function getCategories(signal?: AbortSignal): Promise<CatalogCategory[]> {
  const data = await apiFetch<ApiCategoriesResponse>('/api/categories', { signal })
  return data.categories.map(mapCategory)
}

