import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminGetOrder,
  adminListOrders,
  adminUpdateOrderStatus,
} from '../controllers/admin.orders.controller'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminOrdersRouter.get('/', adminListOrders)
adminOrdersRouter.get('/:id', adminGetOrder)
adminOrdersRouter.put('/:id/status', adminUpdateOrderStatus)

