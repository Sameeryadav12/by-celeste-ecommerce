import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { getPublicOrderStatus } from '../services/checkout.service'
import { paramString } from '../utils/routeParams'
import { ApiError } from '../utils/apiError'

export const getOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ORDER_ID', message: 'Order id is required.' })
  }
  const data = await getPublicOrderStatus(id)
  res.json({ success: true, data })
})
