import { Role, WholesaleApprovalStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'

export type AdminWholesaleStatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export async function listAdminWholesalers(opts?: {
  search?: string
  status?: AdminWholesaleStatusFilter
  limit?: number
}) {
  const limit = opts?.limit && Number.isFinite(opts.limit) ? Math.min(100, Math.max(1, opts.limit)) : 50

  const where: {
    role: Role
    isActive?: boolean
    wholesaleApprovalStatus?: WholesaleApprovalStatus
    OR?: Array<{
      businessName?: { contains: string; mode: 'insensitive' }
      email?: { contains: string; mode: 'insensitive' }
      firstName?: { contains: string; mode: 'insensitive' }
      lastName?: { contains: string; mode: 'insensitive' }
    }>
  } = { role: Role.WHOLESALE }

  if (opts?.status === 'SUSPENDED') {
    where.isActive = false
  } else if (opts?.status) {
    where.isActive = true
    where.wholesaleApprovalStatus = opts.status
  }

  if (opts?.search?.trim()) {
    const search = opts.search.trim()
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      businessName: true,
      wholesaleApprovalStatus: true,
      isActive: true,
      createdAt: true,
      approvedAt: true,
    },
  })

  return rows.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    businessName: u.businessName,
    status: u.isActive ? u.wholesaleApprovalStatus : 'SUSPENDED',
    wholesaleApprovalStatus: u.wholesaleApprovalStatus,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    approvedAt: u.approvedAt?.toISOString() ?? null,
  }))
}

export async function getAdminWholesalerById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: Role.WHOLESALE },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      businessName: true,
      abn: true,
      wholesaleNotes: true,
      wholesaleApprovalStatus: true,
      isActive: true,
      approvedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'WHOLESALER_NOT_FOUND',
      message: 'Wholesale account not found.',
    })
  }

  const latestOrder = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { phone: true },
  })

  return {
    ...user,
    status: user.isActive ? user.wholesaleApprovalStatus : 'SUSPENDED',
    phone: latestOrder?.phone ?? null,
    approvedAt: user.approvedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    compliance: {
      productOwnershipModeled: false,
      note: 'Direct wholesaler-product ownership is not yet modeled in the backend.',
    },
  }
}

export async function moderateWholesaleStatus(input: {
  userId: string
  action: 'APPROVE' | 'REJECT' | 'SUSPEND'
}) {
  const existing = await prisma.user.findFirst({
    where: { id: input.userId, role: Role.WHOLESALE },
    select: { id: true },
  })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'WHOLESALER_NOT_FOUND',
      message: 'Wholesale account not found.',
    })
  }

  const updated = await prisma.user.update({
    where: { id: input.userId },
    data:
      input.action === 'APPROVE'
        ? {
            isActive: true,
            wholesaleApprovalStatus: WholesaleApprovalStatus.APPROVED,
            approvedAt: new Date(),
          }
        : input.action === 'REJECT'
          ? {
              isActive: true,
              wholesaleApprovalStatus: WholesaleApprovalStatus.REJECTED,
              approvedAt: null,
            }
          : {
              isActive: false,
            },
    select: {
      id: true,
      wholesaleApprovalStatus: true,
      isActive: true,
      approvedAt: true,
      updatedAt: true,
    },
  })

  return {
    id: updated.id,
    status: updated.isActive ? updated.wholesaleApprovalStatus : 'SUSPENDED',
    wholesaleApprovalStatus: updated.wholesaleApprovalStatus,
    isActive: updated.isActive,
    approvedAt: updated.approvedAt?.toISOString() ?? null,
    updatedAt: updated.updatedAt.toISOString(),
  }
}
