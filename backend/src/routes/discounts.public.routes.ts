import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.middleware'
import { validateCouponPublic } from '../controllers/discounts.public.controller'

export const discountsPublicRouter = Router()

discountsPublicRouter.post('/validate', optionalAuth, validateCouponPublic)
