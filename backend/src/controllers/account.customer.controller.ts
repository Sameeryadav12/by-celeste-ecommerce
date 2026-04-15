import type { Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import { setAuthCookie, signAccessToken } from '../utils/tokens'
import {
  getSafeUserById,
  getLoyaltyDashboardForUser,
  getOrderDetailForUser,
  listOrdersForUser,
  updateAccountPassword,
  updateAccountProfile,
} from '../services/accountCustomer.service'

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const orders = await listOrdersForUser(req.user.id)
  res.json({ success: true, data: { orders } })
})

export const getMyAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const user = await getSafeUserById(req.user.id)
  if (!user) {
    throw new ApiError({ statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' })
  }
  res.json({ success: true, data: { user } })
})

export const getMyOrderById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const orderId = paramString(req.params.id)
  if (!orderId) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ORDER_ID', message: 'Order id is required.' })
  }
  const order = await getOrderDetailForUser(req.user.id, orderId)
  res.json({ success: true, data: { order } })
})

export const getMyLoyalty = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const loyalty = await getLoyaltyDashboardForUser(req.user.id)
  res.json({ success: true, data: loyalty })
})

export const patchMyAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const { user, emailChanged } = await updateAccountProfile(
    req.user.id,
    req.user.role as Role,
    req.body,
  )
  if (emailChanged) {
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role })
    setAuthCookie(res, token)
  }
  res.json({ success: true, data: { user } })
})

export const patchMyPassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  await updateAccountPassword(req.user.id, req.body)
  res.json({ success: true, data: { message: 'Password updated.' } })
})
