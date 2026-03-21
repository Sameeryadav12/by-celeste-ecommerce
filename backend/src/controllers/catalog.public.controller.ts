import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { listCategoriesPublic } from '../services/category.service'
import { listIngredientsPublic } from '../services/ingredient.service'
import { getProductBySlugPublic, listProductsPublic } from '../services/product.service'
import type { ListProductsQuery } from '../services/product.service'
import { paramString } from '../utils/routeParams'

function parseBool(v: unknown): boolean | undefined {
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return undefined
}

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query
  const page = q.page != null ? Number(q.page) : undefined
  const limit = q.limit != null ? Number(q.limit) : undefined

  if (page != null && (!Number.isFinite(page) || page < 1)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Query parameter "page" must be a positive number.',
    })
  }
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Query parameter "limit" must be a positive number.',
    })
  }

  const sortRaw = typeof q.sort === 'string' ? q.sort : undefined
  const allowedSort = ['name_asc', 'name_desc', 'price_asc', 'price_desc'] as const
  const sort = allowedSort.includes(sortRaw as (typeof allowedSort)[number])
    ? (sortRaw as ListProductsQuery['sort'])
    : undefined

  const query: ListProductsQuery = {
    page,
    limit,
    category: typeof q.category === 'string' ? q.category : undefined,
    featured: parseBool(q.featured),
    search: typeof q.search === 'string' ? q.search : undefined,
    sort,
    activeOnly: true,
  }

  const viewer = req.catalogPricingViewer ?? null
  const result = await listProductsPublic(query, viewer)
  res.status(200).json({ success: true, data: result })
})

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = paramString(req.params.slug)
  if (!slug?.trim()) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_SLUG',
      message: 'Product slug is required.',
    })
  }

  const viewer = req.catalogPricingViewer ?? null
  const product = await getProductBySlugPublic(slug.trim(), viewer)
  res.status(200).json({ success: true, data: { product } })
})

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = parseBool(req.query.activeOnly)
  const categories = await listCategoriesPublic({
    activeOnly: activeOnly === false ? false : true,
  })
  res.status(200).json({ success: true, data: { categories } })
})

export const listIngredients = asyncHandler(async (_req: Request, res: Response) => {
  const ingredients = await listIngredientsPublic()
  res.status(200).json({ success: true, data: { ingredients } })
})
