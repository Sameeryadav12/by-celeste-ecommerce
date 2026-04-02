import type { Prisma } from '@prisma/client'
import type { PricingViewer } from './wholesalePricing'
import {
  effectiveProductUnitPrice,
  isShowingWholesaleUnitPrice,
} from './wholesalePricing'

function decimalToString(d: Prisma.Decimal | null | undefined): string | null {
  if (d == null) return null
  return d.toFixed(2)
}

export function serializeCategory(c: {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export function serializeIngredient(i: {
  id: string
  name: string
  slug: string
  description: string
  benefits: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: i.id,
    name: i.name,
    slug: i.slug,
    description: i.description,
    benefits: i.benefits,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }
}

type ProductWithRelations = {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  howToUse: string
  benefits: string[]
  price: Prisma.Decimal
  wholesalePrice: Prisma.Decimal | null
  compareAtPrice: Prisma.Decimal | null
  imageUrl: string
  isActive: boolean
  isFeatured: boolean
  stockQuantity: number
  createdAt: Date
  updatedAt: Date
  categories?: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    isActive: boolean
  }>
  ingredients?: Array<{
    id: string
    name: string
    slug: string
    description: string
    benefits: string | null
  }>
}

/** Public shop API — `price` is what this viewer pays; optional `retailUnitPrice` when wholesale pricing applies. */
export function serializeProductForPublic(p: ProductWithRelations, viewer: PricingViewer, options?: { includeRelations?: boolean }) {
  const effective = effectiveProductUnitPrice(p, viewer)
  const isWholesalePrice = isShowingWholesaleUnitPrice(p, viewer)

  const base = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    howToUse: p.howToUse,
    benefits: p.benefits,
    price: decimalToString(effective)!,
    ...(isWholesalePrice ? { retailUnitPrice: decimalToString(p.price)! } : {}),
    isWholesalePrice,
    compareAtPrice: decimalToString(p.compareAtPrice),
    imageUrl: p.imageUrl,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    stockQuantity: p.stockQuantity,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }

  if (!options?.includeRelations) {
    return base
  }

  return {
    ...base,
    ...(p.categories
      ? {
          categories: p.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            isActive: c.isActive,
          })),
        }
      : {}),
    ...(p.ingredients
      ? {
          ingredients: p.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            description: i.description,
            benefits: i.benefits,
          })),
        }
      : {}),
  }
}

/** Admin / raw catalog — always exposes DB retail `price` plus optional `wholesalePrice`. */
export function serializeProductForAdmin(p: ProductWithRelations, options?: { includeRelations?: boolean }) {
  const base = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    howToUse: p.howToUse,
    benefits: p.benefits,
    price: decimalToString(p.price)!,
    wholesalePrice: decimalToString(p.wholesalePrice),
    compareAtPrice: decimalToString(p.compareAtPrice),
    imageUrl: p.imageUrl,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    stockQuantity: p.stockQuantity,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }

  if (!options?.includeRelations) {
    return base
  }

  return {
    ...base,
    ...(p.categories
      ? {
          categories: p.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            isActive: c.isActive,
          })),
        }
      : {}),
    ...(p.ingredients
      ? {
          ingredients: p.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            description: i.description,
            benefits: i.benefits,
          })),
        }
      : {}),
  }
}
