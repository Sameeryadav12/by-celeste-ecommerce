import { Router } from 'express'
import { getProductBySlug, listProducts } from '../controllers/catalog.public.controller'
import { loadCatalogPricingViewer } from '../middleware/catalogPricingViewer.middleware'

export const productPublicRouter = Router()

productPublicRouter.get('/', loadCatalogPricingViewer, listProducts)
productPublicRouter.get('/:slug', loadCatalogPricingViewer, getProductBySlug)
