import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import {
  getLoyaltyDashboardForUser,
  getOrderDetailForUser,
  listOrdersForUser,
} from '../services/accountCustomer.service'

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in.' })
  }
  const orders = await listOrdersForUser(req.user.id)
  res.json({ success: true, data: { orders } })
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
