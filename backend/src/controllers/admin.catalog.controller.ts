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
  deactivateIngredient,
  deleteIngredient,
  listIngredientsAdmin,
  updateIngredient,
} from '../services/ingredient.service'
import {
  createProduct,
  permanentlyDeleteProduct,
  exportAdminProductsCsv,
  getAdminProductById,
  listProductsAdmin,
  updateProduct,
} from '../services/product.service'
import { sendCsvAttachment, wantsCsvFormat } from '../utils/csvResponse'
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

export const adminListIngredients = asyncHandler(async (_req: Request, res: Response) => {
  const ingredients = await listIngredientsAdmin()
  res.status(200).json({ success: true, data: { ingredients } })
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
  const ingredient = await deactivateIngredient(id)
  res.status(200).json({ success: true, data: { ingredient, message: 'Ingredient hidden.' } })
})

export const adminPermanentDeleteIngredient = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Ingredient id is required.',
    })
  }
  await deleteIngredient(id)
  res.status(200).json({ success: true, data: { message: 'Ingredient permanently deleted.' } })
})

export const adminCreateProduct = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const firstFieldMessage = Object.values(flat.fieldErrors).flat()[0]
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: firstFieldMessage ?? 'Please check the product fields and try again.',
      details: flat,
    })
  }
  const product = await createProduct(parsed.data)
  res.status(201).json({ success: true, data: { product } })
})

export const adminUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const firstFieldMessage = Object.values(flat.fieldErrors).flat()[0]
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: firstFieldMessage ?? 'Please check the product fields and try again.',
      details: flat,
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
  const deleted = await permanentlyDeleteProduct(id)
  res.status(200).json({
    success: true,
    data: { message: `"${deleted.name}" was permanently deleted.`, id: deleted.id },
  })
})

export const adminGetProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Product id is required.' })
  }
  const product = await getAdminProductById(id)
  res.status(200).json({ success: true, data: { product } })
})

function buildAdminProductListQuery(q: Request['query']) {
  const sortRaw = typeof q.sort === 'string' ? q.sort : undefined
  const allowedSort = ['name_asc', 'name_desc', 'price_asc', 'price_desc'] as const
  const sort = allowedSort.includes(sortRaw as (typeof allowedSort)[number])
    ? (sortRaw as 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc')
    : undefined

  return {
    page: q.page != null ? Number(q.page) : undefined,
    limit: q.limit != null ? Number(q.limit) : undefined,
    category: typeof q.category === 'string' ? q.category : undefined,
    featured: q.featured === 'true' || q.featured === '1' ? true : undefined,
    search: typeof q.search === 'string' ? q.search : undefined,
    sort,
    activeOnly: q.activeOnly === 'false' || q.activeOnly === '0' ? false : true,
  }
}

/** Dedicated CSV download — avoids Express treating `export` as a product id. */
export const adminDownloadProductsCsv = asyncHandler(async (req: Request, res: Response) => {
  const listQuery = buildAdminProductListQuery(req.query)
  const csv = await exportAdminProductsCsv(listQuery)
  const stamp = new Date().toISOString().slice(0, 10)
  sendCsvAttachment(res, `by-celeste-products-${stamp}.csv`, csv)
})

export const adminListProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query
  const listQuery = buildAdminProductListQuery(q)

  if (wantsCsvFormat(q)) {
    const csv = await exportAdminProductsCsv(listQuery)
    const stamp = new Date().toISOString().slice(0, 10)
    sendCsvAttachment(res, `by-celeste-products-${stamp}.csv`, csv)
    return
  }

  const result = await listProductsAdmin(listQuery)
  res.status(200).json({ success: true, data: result })
})
