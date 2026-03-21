import type {
  CatalogCategory,
  CatalogIngredient,
  CatalogPagination,
  CatalogProduct,
} from './catalogTypes'

type ApiCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

type ApiIngredient = {
  id: string
  name: string
  slug: string
  description: string
  benefits: string | null
}

type ApiProduct = {
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
  categories?: ApiCategory[]
  ingredients?: ApiIngredient[]
}

function toAbsoluteImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  // Seed data stores product images as root-relative paths like `/images/products/...`.
  // Those images are expected to be served from the frontend static/public folder,
  // not from the backend API host.
  if (imageUrl.startsWith('/')) return imageUrl
  return imageUrl
}

export function mapCategory(raw: ApiCategory): CatalogCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    isActive: raw.isActive,
  }
}

export function mapIngredient(raw: ApiIngredient): CatalogIngredient {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    benefits: raw.benefits,
  }
}

export function mapProduct(raw: ApiProduct): CatalogProduct {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    shortDescription: raw.shortDescription,
    description: raw.description,
    howToUse: raw.howToUse,
    benefits: raw.benefits ?? [],
    price: Number(raw.price),
    retailUnitPrice:
      raw.retailUnitPrice != null && raw.retailUnitPrice !== ''
        ? Number(raw.retailUnitPrice)
        : undefined,
    isWholesalePrice: Boolean(raw.isWholesalePrice),
    compareAtPrice: raw.compareAtPrice == null ? null : Number(raw.compareAtPrice),
    imageUrl: toAbsoluteImageUrl(raw.imageUrl),
    isFeatured: raw.isFeatured,
    stockQuantity: raw.stockQuantity,
    categories: (raw.categories ?? []).map(mapCategory),
    ingredients: (raw.ingredients ?? []).map(mapIngredient),
  }
}

export function mapPagination(raw: CatalogPagination): CatalogPagination {
  return {
    page: raw.page,
    limit: raw.limit,
    total: raw.total,
    totalPages: raw.totalPages,
  }
}

