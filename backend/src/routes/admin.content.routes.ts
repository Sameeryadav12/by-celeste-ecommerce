import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminGetMarketingContent,
  adminUpdateMarketingContent,
} from '../controllers/marketingContent.controller'
import {
  adminGetBusinessSettings,
  adminGetThemeSettings,
  adminUpdateBusinessSettings,
  adminUpdateThemeSettings,
} from '../controllers/themeBusiness.controller'

export const adminContentRouter = Router()

adminContentRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminContentRouter.get('/marketing', adminGetMarketingContent)
adminContentRouter.put('/marketing', adminUpdateMarketingContent)
adminContentRouter.get('/theme', adminGetThemeSettings)
adminContentRouter.put('/theme', adminUpdateThemeSettings)
adminContentRouter.get('/business', adminGetBusinessSettings)
adminContentRouter.put('/business', adminUpdateBusinessSettings)
