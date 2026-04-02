import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  ingredientCreateSchema,
  ingredientUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
} from '../services/catalog.validation'
import {
  createCategory,
  deactivateCategory,
  updateCategory,
} from '../services/category.service'
import {
  createIngredient,
  deleteIngredient,
  updateIngredient,
} from '../services/ingredient.service'
import {
  createProduct,
  deactivateProduct,
  getAdminProductById,
  listProductsAdmin,
  updateProduct,
} from '../services/product.service'
import { paramString } from '../utils/routeParams'

export const adminCreateCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = categoryCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the category fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const category = await createCategory(parsed.data)
  res.status(201).json({ success: true, data: { category } })
})

export const adminUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = categoryUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the category fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Category id is required.' })
  }
  const category = await updateCategory(id, parsed.data)
  res.status(200).json({ success: true, data: { category } })
})

export const adminDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Category id is required.' })
  }
  const category = await deactivateCategory(id)
  res.status(200).json({ success: true, data: { category, message: 'Category deactivated.' } })
})

export const adminCreateIngredient = asyncHandler(async (req: Request, res: Response) => {
  const parsed = ingredientCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the ingredient fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const ingredient = await createIngredient(parsed.data)
  res.status(201).json({ success: true, data: { ingredient } })
})

export const adminUpdateIngredient = asyncHandler(async (req: Request, res: Response) => {
  const parsed = ingredientUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the ingredient fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Ingredient id is required.',
    })
  }
  const ingredient = await updateIngredient(id, parsed.data)
  res.status(200).json({ success: true, data: { ingredient } })
})

export const adminDeleteIngredient = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Ingredient id is required.',
    })
  }
  await deleteIngredient(id)
  res.status(200).json({ success: true, data: { message: 'Ingredient removed.' } })
})

export const adminCreateProduct = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the product fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const product = await createProduct(parsed.data)
  res.status(201).json({ success: true, data: { product } })
})

export const adminUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the product fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Product id is required.' })
  }
  const product = await updateProduct(id, parsed.data)
  res.status(200).json({ success: true, data: { product } })
})

export const adminDeleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Product id is required.' })
  }
  const product = await deactivateProduct(id)
  res.status(200).json({ success: true, data: { product, message: 'Product deactivated.' } })
})

export const adminGetProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Product id is required.' })
  }
  const product = await getAdminProductById(id)
  res.status(200).json({ success: true, data: { product } })
})

/** Optional: admin can list all products including inactive (same query params as public). */
export const adminListProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query
  const page = q.page != null ? Number(q.page) : undefined
  const limit = q.limit != null ? Number(q.limit) : undefined
  const sortRaw = typeof q.sort === 'string' ? q.sort : undefined
  const allowedSort = ['name_asc', 'name_desc', 'price_asc', 'price_desc'] as const
  const sort = allowedSort.includes(sortRaw as (typeof allowedSort)[number])
    ? (sortRaw as 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc')
    : undefined

  const result = await listProductsAdmin({
    page,
    limit,
    category: typeof q.category === 'string' ? q.category : undefined,
    featured: q.featured === 'true' || q.featured === '1' ? true : undefined,
    search: typeof q.search === 'string' ? q.search : undefined,
    sort,
    activeOnly: q.activeOnly === 'false' || q.activeOnly === '0' ? false : true,
  })
  res.status(200).json({ success: true, data: result })
})
