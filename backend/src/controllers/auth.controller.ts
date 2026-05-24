import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { clearAuthCookie, setAuthCookie, signAccessToken, signTwoFactorPendingToken, verifyTwoFactorPendingToken } from '../utils/tokens'
import {
  authenticateUser,
  createUserAsPublicSignup,
  createWholesaleApplicationUser,
  getSafeUserById,
} from '../services/auth.service'
import { loginSchema, signupSchema, loginTotpSchema } from '../services/auth.validation'
import { verifyAdminTotpForLogin } from '../services/adminTotp.service'
import { wholesaleApplySchema } from '../services/wholesaleApply.validation'

export const wholesaleApply = asyncHandler(async (req: Request, res: Response) => {
  const parsed = wholesaleApplySchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the wholesale application fields and try again.',
      details: parsed.error.flatten(),
    })
  }

  const user = await createWholesaleApplicationUser(parsed.data)
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  setAuthCookie(res, token)

  res.status(201).json({ success: true, data: { user } })
})

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the signup fields and try again.',
      details: parsed.error.flatten(),
    })
  }

  const user = await createUserAsPublicSignup(parsed.data)
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  setAuthCookie(res, token)

  res.status(201).json({ success: true, data: { user } })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check your email and password and try again.',
      details: parsed.error.flatten(),
    })
  }

  const { user, totpLoginRequired } = await authenticateUser(parsed.data)

  // Admin-only TOTP today (authenticator app). Customers and wholesale are never prompted here.
  // Future: optionally require TOTP for approved WHOLESALE accounts using the same pending-token flow.
  if (totpLoginRequired) {
    const twoFactorToken = signTwoFactorPendingToken({ sub: user.id, email: user.email })
    res.status(200).json({
      success: true,
      data: {
        requiresTwoFactor: true as const,
        twoFactorToken,
      },
    })
    return
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  setAuthCookie(res, token)

  res.status(200).json({ success: true, data: { user } })
})

export const loginTotp = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginTotpSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please enter your authenticator code and try again.',
      details: parsed.error.flatten(),
    })
  }

  let pending: ReturnType<typeof verifyTwoFactorPendingToken>
  try {
    pending = verifyTwoFactorPendingToken(parsed.data.twoFactorToken)
  } catch {
    throw new ApiError({
      statusCode: 401,
      code: 'TOTP_TOKEN_INVALID',
      message: 'Your sign-in challenge expired or is invalid. Please sign in again with email and password.',
    })
  }

  await verifyAdminTotpForLogin(pending.sub, parsed.data.code)

  const user = await getSafeUserById(pending.sub)
  if (!user || user.role !== 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Two-factor sign-in is only available for administrator accounts.',
    })
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  setAuthCookie(res, token)

  res.status(200).json({ success: true, data: { user } })
})

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res)
  res.status(200).json({ success: true, data: { message: 'Logged out.' } })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      message: 'You are not logged in.',
    })
  }

  const user = await getSafeUserById(req.user.id)
  if (!user) {
    clearAuthCookie(res)
    throw new ApiError({
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      message: 'You are not logged in.',
    })
  }

  res.status(200).json({ success: true, data: { user } })
})

