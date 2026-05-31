import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { evaluateCouponForUse } from '../services/discountCoupon.service'
import { validateCouponPublicSchema } from '../services/discountCoupon.validation'

export const validateCouponPublic = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validateCouponPublicSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please enter a coupon code and a cart subtotal.',
      details: parsed.error.flatten(),
    })
  }

  const subtotal = new Prisma.Decimal(parsed.data.subtotal.toFixed(2))

  // Resolve audience: request body wins, but if user is authenticated as an approved wholesale
  // account on the server side we still pass that signal so coupons can't bypass via the body.
  const isWholesale = Boolean(parsed.data.isWholesale) || req.user?.role === 'WHOLESALE'

  const applied = await evaluateCouponForUse({
    code: parsed.data.code,
    subtotal,
    ctx: {
      isWholesale,
      userId: req.user?.id ?? null,
      email: parsed.data.userEmail ?? req.user?.email ?? null,
    },
  })

  res.json({
    success: true,
    data: {
      valid: true,
      message: `Coupon ${applied.code} applied.`,
      code: applied.code,
      percentage: applied.percentage,
      discountAmount: applied.discountAmount.toFixed(2),
      subtotalAfterDiscount: applied.subtotalAfterDiscount.toFixed(2),
    },
  })
})
