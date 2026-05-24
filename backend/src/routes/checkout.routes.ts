import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.middleware'
import {
  getCheckoutReadiness,
  postCreateCheckoutSession,
} from '../controllers/checkout.controller'

export const checkoutRouter = Router()

checkoutRouter.get('/readiness', getCheckoutReadiness)
checkoutRouter.post('/create-session', optionalAuth, postCreateCheckoutSession)
