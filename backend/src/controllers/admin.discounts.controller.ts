import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import {
  adminCreateCoupon,
  adminDeleteCoupon,
  adminGetCoupon,
  adminListCoupons,
  adminUpdateCoupon,
} from '../services/adminDiscountCoupon.service'
import {
  createCouponSchema,
  updateCouponSchema,
} from '../services/discountCoupon.validation'

export const adminListDiscountCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await adminListCoupons()
  res.json({ success: true, data: { coupons } })
})

export const adminGetDiscountCoupon = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Coupon id is required.' })
  }
  const coupon = await adminGetCoupon(id)
  res.json({ success: true, data: { coupon } })
})

export const adminCreateDiscountCoupon = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCouponSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the coupon fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const coupon = await adminCreateCoupon(parsed.data)
  res.status(201).json({ success: true, data: { coupon } })
})

export const adminUpdateDiscountCoupon = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Coupon id is required.' })
  }
  const parsed = updateCouponSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the coupon fields and try again.',
      details: parsed.error.flatten(),
    })
  }
  const coupon = await adminUpdateCoupon(id, parsed.data)
  res.json({ success: true, data: { coupon } })
})

export const adminDeleteDiscountCoupon = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Coupon id is required.' })
  }
  await adminDeleteCoupon(id)
  res.json({ success: true, data: { message: 'Coupon removed.' } })
})
