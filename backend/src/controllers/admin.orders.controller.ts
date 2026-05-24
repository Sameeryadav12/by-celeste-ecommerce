import type { Request, Response } from 'express'
import { OrderPaymentStatus, OrderStatus } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { sendCsvAttachment, wantsCsvFormat } from '../utils/csvResponse'
import { paramString } from '../utils/routeParams'
import {
  exportAdminOrdersCsv,
  getAdminOrderById,
  listAdminOrders,
  updateAdminOrderStatus,
} from '../services/adminOrders.service'

function parseAdminOrderListFilters(q: Request['query']) {
  const search = typeof q.search === 'string' ? q.search : undefined
  const statusRaw = typeof q.status === 'string' ? q.status : undefined
  const paymentStatusRaw = typeof q.paymentStatus === 'string' ? q.paymentStatus : undefined
  const status = statusRaw && statusRaw in OrderStatus ? (statusRaw as OrderStatus) : undefined
  const paymentStatus =
    paymentStatusRaw && paymentStatusRaw in OrderPaymentStatus
      ? (paymentStatusRaw as OrderPaymentStatus)
      : undefined
  return { search, statusRaw, paymentStatusRaw, status, paymentStatus }
}

/** Dedicated CSV download — avoids Express treating `export` as an order id. */
export const adminDownloadOrdersCsv = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, paymentStatus } = parseAdminOrderListFilters(req.query)
  const csv = await exportAdminOrdersCsv({ search, status, paymentStatus })
  const stamp = new Date().toISOString().slice(0, 10)
  sendCsvAttachment(res, `by-celeste-orders-${stamp}.csv`, csv)
})

export const adminListOrders = asyncHandler(async (req: Request, res: Response) => {
  const { search, statusRaw, paymentStatusRaw, status, paymentStatus } =
    parseAdminOrderListFilters(req.query)

  if (wantsCsvFormat(req.query)) {
    const csv = await exportAdminOrdersCsv({ search, status, paymentStatus })
    const stamp = new Date().toISOString().slice(0, 10)
    sendCsvAttachment(res, `by-celeste-orders-${stamp}.csv`, csv)
    return
  }

  const qLimit = req.query.limit
  const limit = qLimit != null ? Number(qLimit) : undefined
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_QUERY', message: 'limit must be a positive number.' })
  }

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

