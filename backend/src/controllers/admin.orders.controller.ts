import type { Request, Response } from 'express'
import { OrderPaymentStatus, OrderStatus } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import { getAdminOrderById, listAdminOrders, updateAdminOrderStatus } from '../services/adminOrders.service'

export const adminListOrders = asyncHandler(async (req: Request, res: Response) => {
  const qLimit = req.query.limit
  const limit = qLimit != null ? Number(qLimit) : undefined
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_QUERY', message: 'limit must be a positive number.' })
  }

  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const statusRaw = typeof req.query.status === 'string' ? req.query.status : undefined
  const paymentStatusRaw =
    typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined
  const status = statusRaw && statusRaw in OrderStatus ? (statusRaw as OrderStatus) : undefined
  const paymentStatus =
    paymentStatusRaw && paymentStatusRaw in OrderPaymentStatus
      ? (paymentStatusRaw as OrderPaymentStatus)
      : undefined

  if (statusRaw && !status) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Invalid order status filter.',
    })
  }
  if (paymentStatusRaw && !paymentStatus) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Invalid payment status filter.',
    })
  }

  const orders = await listAdminOrders({ limit, search, status, paymentStatus })
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

export const adminUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ORDER_ID', message: 'Order id is required.' })
  }
  const statusRaw = req.body?.status
  if (typeof statusRaw !== 'string' || !(statusRaw in OrderStatus)) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please provide a valid order status.',
    })
  }

  const order = await updateAdminOrderStatus(id, statusRaw as OrderStatus)
  res.json({ success: true, data: { order } })
})

