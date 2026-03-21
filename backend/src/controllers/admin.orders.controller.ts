import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import { getAdminOrderById, listAdminOrders } from '../services/adminOrders.service'

export const adminListOrders = asyncHandler(async (req: Request, res: Response) => {
  const qLimit = req.query.limit
  const limit = qLimit != null ? Number(qLimit) : undefined
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_QUERY', message: 'limit must be a positive number.' })
  }

  const orders = await listAdminOrders({ limit })
  res.json({ success: true, data: { orders } })
})

export const adminGetOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ORDER_ID', message: 'Order id is required.' })
  }

  const order = await getAdminOrderById(id)
  res.json({ success: true, data: { order } })
})

