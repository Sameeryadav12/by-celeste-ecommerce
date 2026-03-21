import { Router } from 'express'
import { listCategories } from '../controllers/catalog.public.controller'

export const categoryPublicRouter = Router()

categoryPublicRouter.get('/', listCategories)
