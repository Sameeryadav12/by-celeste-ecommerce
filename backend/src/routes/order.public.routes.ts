import { Router } from 'express'
import { getOrderStatus } from '../controllers/order.public.controller'

export const orderPublicRouter = Router()

orderPublicRouter.get('/:id/status', getOrderStatus)
