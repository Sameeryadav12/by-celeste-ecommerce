import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.middleware'
import { postCreateCheckoutSession } from '../controllers/checkout.controller'

export const checkoutRouter = Router()

checkoutRouter.post('/create-session', optionalAuth, postCreateCheckoutSession)
