import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { getAdminSummaryHandler } from '../controllers/admin.summary.controller'

export const adminSummaryRouter = Router()

adminSummaryRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminSummaryRouter.get('/summary', getAdminSummaryHandler)

