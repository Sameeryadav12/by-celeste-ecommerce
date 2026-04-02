import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { slugify } from '../utils/slug'
import { serializeProductForAdmin, serializeProductForPublic } from './catalog.serialize'
import type { PricingViewer } from './wholesalePricing'
import type { ProductCreateInput, ProductUpdateInput } from './catalog.validation'

export type ListProductsQuery = {
  page?: number
  limit?: number
  category?: string
  featured?: boolean
  search?: string
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  /** When false, include inactive products (admin only). Public APIs always use active only. */
  activeOnly?: boolean
}

async function ensureUniqueProductSlug(base: string, excludeId?: string) {
  let candidate = base
  let n = 1
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

async function assertCategoryIdsExist(ids: string[]) {
  if (!ids.length) return
  const found = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  })
  if (found.length !== ids.length) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_CATEGORY_IDS',
      message: 'One or more category IDs do not exist.',
    })
  }
}

async function assertIngredientIdsExist(ids: string[]) {
  if (!ids.length) return
  const found = await prisma.ingredient.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  })
  if (found.length !== ids.length) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INGREDIENT_IDS',
      message: 'One or more ingredient IDs do not exist.',
    })
  }
}

function orderByFromSort(sort?: ListProductsQuery['sort']): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'name_desc':
      return { name: 'desc' }
    case 'price_asc':
      return { price: 'asc' }
    case 'price_desc':
      return { price: 'desc' }
    case 'name_asc':
    default:
      return { name: 'asc' }
  }
}

export async function listProductsPublic(query: ListProductsQuery, viewer: PricingViewer) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(50, Math.max(1, query.limit ?? 20))
  const activeOnly = query.activeOnly !== false

  const where: Prisma.ProductWhereInput = {}

  if (activeOnly) {
    where.isActive = true
  }

  if (query.featured === true) {
    where.isFeatured = true
  }

  if (query.category?.trim()) {
    const c = query.category.trim()
    where.categories = {
      some: {
        OR: [{ slug: c }, { id: c }],
        ...(activeOnly ? { isActive: true } : {}),
      },
    }
  }

  if (query.search?.trim()) {
    where.name = { contains: query.search.trim(), mode: 'insensitive' }
  }

  const orderBy = orderByFromSort(query.sort)

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  const products = rows.map((p) => serializeProductForPublic(p, viewer))

  const totalPages = Math.ceil(total / limit) || 1

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

export async function listProductsAdmin(query: ListProductsQuery) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(50, Math.max(1, query.limit ?? 20))
  const activeOnly = query.activeOnly !== false

  const where: Prisma.ProductWhereInput = {}

  if (activeOnly) {
    where.isActive = true
  }

  if (query.featured === true) {
    where.isFeatured = true
  }

  if (query.category?.trim()) {
    const c = query.category.trim()
    where.categories = {
      some: {
        OR: [{ slug: c }, { id: c }],
        ...(activeOnly ? { isActive: true } : {}),
      },
    }
  }

  if (query.search?.trim()) {
    where.name = { contains: query.search.trim(), mode: 'insensitive' }
  }

  const orderBy = orderByFromSort(query.sort)

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: {
          select: { id: true, name: true, slug: true, description: true, isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  const products = rows.map((p) => serializeProductForAdmin(p, { includeRelations: true }))
  const totalPages = Math.ceil(total / limit) || 1

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

export async function getProductBySlugPublic(slug: string, viewer: PricingViewer) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      categories: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, description: true, isActive: true },
      },
      ingredients: {
        select: { id: true, name: true, slug: true, description: true, benefits: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!product) {
    throw new ApiError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
    })
  }

  return serializeProductForPublic(product, viewer, { includeRelations: true })
}

export async function createProduct(input: ProductCreateInput) {
  const slug = input.slug?.length
    ? input.slug
    : await ensureUniqueProductSlug(slugify(input.name))

  const categoryIds = input.categoryIds ?? []
  const ingredientIds = input.ingredientIds ?? []
  await assertCategoryIdsExist(categoryIds)
  await assertIngredientIdsExist(ingredientIds)

  const created = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug,
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      howToUse: input.howToUse.trim(),
      price: new Prisma.Decimal(input.price),
      wholesalePrice:
        input.wholesalePrice != null ? new Prisma.Decimal(input.wholesalePrice) : null,
      compareAtPrice:
        input.compareAtPrice != null ? new Prisma.Decimal(input.compareAtPrice) : null,
      imageUrl: input.imageUrl.trim(),
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      stockQuantity: input.stockQuantity,
      categories:
        categoryIds.length > 0
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
      ingredients:
        ingredientIds.length > 0
          ? { connect: ingredientIds.map((id) => ({ id })) }
          : undefined,
    },
    include: {
      categories: true,
      ingredients: true,
    },
  })

  return serializeProductForAdmin(created, { includeRelations: true })
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { categories: true, ingredients: true },
  })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
    })
  }

  let slug = existing.slug
  if (input.slug != null) {
    slug = await ensureUniqueProductSlug(input.slug, id)
  }

  const categoryIds = input.categoryIds
  const ingredientIds = input.ingredientIds
  if (categoryIds) await assertCategoryIdsExist(categoryIds)
  if (ingredientIds) await assertIngredientIdsExist(ingredientIds)

  const nextPrice = input.price != null ? new Prisma.Decimal(input.price) : existing.price
  const nextWholesale =
    input.wholesalePrice === undefined
      ? existing.wholesalePrice
      : input.wholesalePrice === null
        ? null
        : new Prisma.Decimal(input.wholesalePrice)
  const nextCompare =
    input.compareAtPrice === null
      ? null
      : input.compareAtPrice != null
        ? new Prisma.Decimal(input.compareAtPrice)
        : existing.compareAtPrice

  if (nextWholesale != null && nextWholesale.gt(nextPrice)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_WHOLESALE_PRICE',
      message: 'Wholesale price must be less than or equal to the retail price.',
    })
  }

  if (nextCompare != null && nextCompare.lt(nextPrice)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_COMPARE_AT_PRICE',
      message: 'Compare-at price must be greater than or equal to the regular price.',
    })
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name.trim() } : {}),
      slug,
      ...(input.shortDescription != null
        ? { shortDescription: input.shortDescription.trim() }
        : {}),
      ...(input.description != null ? { description: input.description.trim() } : {}),
      ...(input.howToUse != null ? { howToUse: input.howToUse.trim() } : {}),
      ...(input.price != null ? { price: new Prisma.Decimal(input.price) } : {}),
      ...(input.wholesalePrice !== undefined
        ? {
            wholesalePrice:
              input.wholesalePrice === null ? null : new Prisma.Decimal(input.wholesalePrice),
          }
        : {}),
      ...(input.compareAtPrice !== undefined
        ? {
            compareAtPrice:
              input.compareAtPrice === null ? null : new Prisma.Decimal(input.compareAtPrice),
          }
        : {}),
      ...(input.imageUrl != null ? { imageUrl: input.imageUrl.trim() } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
      ...(categoryIds
        ? { categories: { set: categoryIds.map((cid) => ({ id: cid })) } }
        : {}),
      ...(ingredientIds
        ? { ingredients: { set: ingredientIds.map((iid) => ({ id: iid })) } }
        : {}),
    },
    include: {
      categories: true,
      ingredients: true,
    },
  })

  return serializeProductForAdmin(updated, { includeRelations: true })
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      ingredients: true,
    },
  })

  if (!product) {
    throw new ApiError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
    })
  }

  return serializeProductForAdmin(product, { includeRelations: true })
}

/** Soft delete: product no longer appears in public shop; data kept for future orders. */
export async function deactivateProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
    })
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { categories: true, ingredients: true },
  })

  return serializeProductForAdmin(updated, { includeRelations: true })
}
