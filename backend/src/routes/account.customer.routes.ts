import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getMyLoyalty, getMyOrderById, getMyOrders } from '../controllers/account.customer.controller'

export const accountCustomerRouter = Router()

accountCustomerRouter.use(requireAuth)

accountCustomerRouter.get('/orders', getMyOrders)
accountCustomerRouter.get('/orders/:id', getMyOrderById)
accountCustomerRouter.get('/loyalty', getMyLoyalty)
