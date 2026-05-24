import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import {
  disableAdminTotp,
  getAdminTotpStatus,
  startAdminTotpSetup,
  verifyAndEnableAdminTotp,
} from '../services/adminTotp.service'
import { totpDisableSchema, totpVerifySetupSchema } from '../services/auth.validation'

export const adminTotpStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Not signed in.' })
  }
  const data = await getAdminTotpStatus(req.user.id)
  res.status(200).json({ success: true, data })
})

export const adminTotpSetupStart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Not signed in.' })
  }
  const data = await startAdminTotpSetup(req.user.id)
  res.status(200).json({ success: true, data })
})

export const adminTotpSetupVerify = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Not signed in.' })
  }
  const parsed = totpVerifySetupSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please enter a valid 6-digit code.',
      details: parsed.error.flatten(),
    })
  }
  await verifyAndEnableAdminTotp(req.user.id, parsed.data.code)
  res.status(200).json({ success: true, data: { totpEnabled: true } })
})

export const adminTotpDisable = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Not signed in.' })
  }
  const parsed = totpDisableSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Password is required.',
      details: parsed.error.flatten(),
    })
  }
  await disableAdminTotp(req.user.id, parsed.data.password)
  res.status(200).json({ success: true, data: { totpEnabled: false } })
})
