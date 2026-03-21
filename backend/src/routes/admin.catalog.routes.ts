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
  adminListProducts,
  adminGetProduct,
  adminUpdateCategory,
  adminUpdateIngredient,
  adminUpdateProduct,
} from '../controllers/admin.catalog.controller'

export const adminCatalogRouter = Router()

adminCatalogRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminCatalogRouter.get('/products', adminListProducts)
adminCatalogRouter.get('/products/:id', adminGetProduct)
adminCatalogRouter.post('/products', adminCreateProduct)
adminCatalogRouter.put('/products/:id', adminUpdateProduct)
adminCatalogRouter.delete('/products/:id', adminDeleteProduct)

adminCatalogRouter.post('/categories', adminCreateCategory)
adminCatalogRouter.put('/categories/:id', adminUpdateCategory)
adminCatalogRouter.delete('/categories/:id', adminDeleteCategory)

adminCatalogRouter.post('/ingredients', adminCreateIngredient)
adminCatalogRouter.put('/ingredients/:id', adminUpdateIngredient)
adminCatalogRouter.delete('/ingredients/:id', adminDeleteIngredient)
