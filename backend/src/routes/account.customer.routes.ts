import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  getMyAccount,
  getMyLoyalty,
  getMyOrderById,
  getMyOrders,
  patchMyAccount,
  patchMyPassword,
} from '../controllers/account.customer.controller'

export const accountCustomerRouter = Router()

accountCustomerRouter.use(requireAuth)

accountCustomerRouter.get('/me', getMyAccount)
accountCustomerRouter.patch('/me', patchMyAccount)
accountCustomerRouter.patch('/password', patchMyPassword)
accountCustomerRouter.get('/orders', getMyOrders)
accountCustomerRouter.get('/orders/:id', getMyOrderById)
accountCustomerRouter.get('/loyalty', getMyLoyalty)
