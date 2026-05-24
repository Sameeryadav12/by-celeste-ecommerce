import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminEventImageUpload,
  adminProductImageUpload,
  completeAdminEventImageUpload,
  completeAdminProductImageUpload,
} from '../controllers/admin.upload.controller'

export const adminUploadRouter = Router()

adminUploadRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminUploadRouter.post(
  '/product-image',
  adminProductImageUpload,
  completeAdminProductImageUpload,
)

adminUploadRouter.post(
  '/event-image',
  adminEventImageUpload,
  completeAdminEventImageUpload,
)
