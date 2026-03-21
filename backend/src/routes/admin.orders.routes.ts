import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { adminGetOrder, adminListOrders } from '../controllers/admin.orders.controller'

export const adminOrdersRouter = Router()

adminOrdersRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminOrdersRouter.get('/', adminListOrders)
adminOrdersRouter.get('/:id', adminGetOrder)

