import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminCreateDiscountCoupon,
  adminDeleteDiscountCoupon,
  adminGetDiscountCoupon,
  adminListDiscountCoupons,
  adminUpdateDiscountCoupon,
} from '../controllers/admin.discounts.controller'

export const adminDiscountsRouter = Router()

adminDiscountsRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminDiscountsRouter.get('/', adminListDiscountCoupons)
adminDiscountsRouter.post('/', adminCreateDiscountCoupon)
adminDiscountsRouter.get('/:id', adminGetDiscountCoupon)
adminDiscountsRouter.put('/:id', adminUpdateDiscountCoupon)
adminDiscountsRouter.delete('/:id', adminDeleteDiscountCoupon)
