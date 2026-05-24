import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminTotpDisable,
  adminTotpSetupStart,
  adminTotpSetupVerify,
  adminTotpStatus,
} from '../controllers/admin.security.controller'

export const adminSecurityRouter = Router()

adminSecurityRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminSecurityRouter.get('/totp/status', adminTotpStatus)
adminSecurityRouter.post('/totp/setup-start', adminTotpSetupStart)
adminSecurityRouter.post('/totp/setup-verify', adminTotpSetupVerify)
adminSecurityRouter.post('/totp/disable', adminTotpDisable)
