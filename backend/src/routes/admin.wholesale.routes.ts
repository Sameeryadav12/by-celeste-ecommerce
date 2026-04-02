import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminGetWholesaler,
  adminListWholesalers,
  adminModerateWholesaler,
} from '../controllers/admin.wholesale.controller'

export const adminWholesaleRouter = Router()

adminWholesaleRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminWholesaleRouter.get('/', adminListWholesalers)
adminWholesaleRouter.get('/:id', adminGetWholesaler)
adminWholesaleRouter.put('/:id/moderation', adminModerateWholesaler)
