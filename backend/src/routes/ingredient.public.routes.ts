import { Router } from 'express'
import { listIngredients } from '../controllers/catalog.public.controller'

export const ingredientPublicRouter = Router()

ingredientPublicRouter.get('/', listIngredients)
