import type { Request, Response } from 'express'
import { Role } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import {
  exportAdminCustomersCsv,
  getAdminCustomerById,
  listAdminCustomers,
  setAdminCustomerActive,
  updateAdminCustomerNotes,
} from '../services/adminCustomers.service'
import { paramString } from '../utils/routeParams'

const ROLES = new Set<string>(['CUSTOMER', 'WHOLESALE', 'ALL'])

export const adminListCustomers = asyncHandler(async (req: Request, res: Response) => {
  const limitRaw = req.query.limit
  const limit = typeof limitRaw === 'string' ? Number(limitRaw) : undefined

  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const roleRaw = typeof req.query.role === 'string' ? req.query.role.toUpperCase() : 'ALL'
  const role = ROLES.has(roleRaw) ? (roleRaw as Role | 'ALL') : 'ALL'

  const statusRaw = typeof req.query.status === 'string' ? req.query.status : 'all'
  const status =
    statusRaw === 'active' || statusRaw === 'inactive' ? statusRaw : ('all' as const)

  const customers = await listAdminCustomers({ limit, search, role, status })
  res.status(200).json({ success: true, data: { customers } })
})

export const adminExportCustomers = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const roleRaw = typeof req.query.role === 'string' ? req.query.role.toUpperCase() : 'ALL'
  const role = ROLES.has(roleRaw) ? (roleRaw as Role | 'ALL') : 'ALL'
  const statusRaw = typeof req.query.status === 'string' ? req.query.status : 'all'
  const status =
    statusRaw === 'active' || statusRaw === 'inactive' ? statusRaw : ('all' as const)

  const csv = await exportAdminCustomersCsv({ search, role, status })
  const stamp = new Date().toISOString().slice(0, 10)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="by-celeste-customers-${stamp}.csv"`)
  res.status(200).send(csv)
})

export const adminGetCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Customer id is required.' })
  }
  const customer = await getAdminCustomerById(id)
  res.status(200).json({ success: true, data: { customer } })
})

export const adminUpdateCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Customer id is required.' })
  }

  const isActive = req.body?.isActive
  if (typeof isActive !== 'boolean') {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request body must include isActive (true or false).',
    })
  }

  const customer = await setAdminCustomerActive(id, isActive)
  res.status(200).json({
    success: true,
    data: {
      customer,
      message: isActive ? 'Account reactivated.' : 'Account deactivated.',
    },
  })
})

export const adminUpdateCustomerNotes = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Customer id is required.' })
  }

  const adminNotes = typeof req.body?.adminNotes === 'string' ? req.body.adminNotes : ''
  const result = await updateAdminCustomerNotes(id, adminNotes)
  res.status(200).json({ success: true, data: result })
})
