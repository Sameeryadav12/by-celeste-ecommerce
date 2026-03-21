import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { clearAuthCookie, setAuthCookie, signAccessToken } from '../utils/tokens'
import {
  authenticateUser,
  createUserAsPublicSignup,
  createWholesaleApplicationUser,
  getSafeUserById,
} from '../services/auth.service'
import { loginSchema, signupSchema } from '../services/auth.validation'
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

  const user = await authenticateUser(parsed.data)
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

