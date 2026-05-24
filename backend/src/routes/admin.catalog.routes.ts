import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminCreateCategory,
  adminCreateIngredient,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteIngredient,
  adminDeleteProduct,
  adminListIngredients,
  adminListProducts,
  adminPermanentDeleteIngredient,
  adminGetProduct,
  adminUpdateCategory,
  adminUpdateIngredient,
  adminUpdateProduct,
} from '../controllers/admin.catalog.controller'

export const adminCatalogRouter = Router()

adminCatalogRouter.use(requireAuth, requireRole([Role.ADMIN]))

const adminProductsRouter = Router()
adminProductsRouter.get('/', adminListProducts)
adminProductsRouter.get('/:id', adminGetProduct)
adminProductsRouter.post('/', adminCreateProduct)
adminProductsRouter.put('/:id', adminUpdateProduct)
adminProductsRouter.delete('/:id', adminDeleteProduct)
adminCatalogRouter.use('/products', adminProductsRouter)

adminCatalogRouter.post('/categories', adminCreateCategory)
adminCatalogRouter.put('/categories/:id', adminUpdateCategory)
adminCatalogRouter.delete('/categories/:id', adminDeleteCategory)

adminCatalogRouter.get('/ingredients', adminListIngredients)
adminCatalogRouter.post('/ingredients', adminCreateIngredient)
adminCatalogRouter.put('/ingredients/:id', adminUpdateIngredient)
adminCatalogRouter.delete('/ingredients/:id/permanent', adminPermanentDeleteIngredient)
adminCatalogRouter.delete('/ingredients/:id', adminDeleteIngredient)
