import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import {
  getAdminWholesalerById,
  listAdminWholesalers,
  moderateWholesaleStatus,
  type AdminWholesaleStatusFilter,
} from '../services/adminWholesale.service'

const statusFilters = new Set<AdminWholesaleStatusFilter>([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
])
const actions = new Set(['APPROVE', 'REJECT', 'SUSPEND'])

export const adminListWholesalers = asyncHandler(async (req: Request, res: Response) => {
  const limitRaw = req.query.limit
  const limit = limitRaw != null ? Number(limitRaw) : undefined
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_QUERY', message: 'limit must be a positive number.' })
  }

  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const statusRaw = typeof req.query.status === 'string' ? req.query.status : undefined
  const status =
    statusRaw && statusFilters.has(statusRaw as AdminWholesaleStatusFilter)
      ? (statusRaw as AdminWholesaleStatusFilter)
      : undefined
  if (statusRaw && !status) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Invalid wholesale status filter.',
    })
  }

  const wholesalers = await listAdminWholesalers({ search, status, limit })
  res.json({ success: true, data: { wholesalers } })
})

export const adminGetWholesaler = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Wholesale user id is required.' })
  }
  const wholesaler = await getAdminWholesalerById(id)
  res.json({ success: true, data: { wholesaler } })
})

export const adminModerateWholesaler = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Wholesale user id is required.' })
  }
  const action = req.body?.action
  if (typeof action !== 'string' || !actions.has(action)) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please provide a valid moderation action.',
    })
  }
  const wholesaler = await moderateWholesaleStatus({
    userId: id,
    action: action as 'APPROVE' | 'REJECT' | 'SUSPEND',
  })
  res.json({ success: true, data: { wholesaler } })
})
