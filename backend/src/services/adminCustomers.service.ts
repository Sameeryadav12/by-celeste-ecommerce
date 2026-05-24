import type { Prisma, Role } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { toCsvRow } from '../utils/csv'

const ADMIN_NOTES_MAX = 5000

function buildCustomerWhere(opts?: {
  search?: string
  role?: Role | 'ALL'
  status?: 'active' | 'inactive' | 'all'
}): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (opts?.role && opts.role !== 'ALL') {
    where.role = opts.role
  } else {
    where.role = { in: ['CUSTOMER', 'WHOLESALE'] }
  }
  if (opts?.status === 'active') where.isActive = true
  if (opts?.status === 'inactive') where.isActive = false

  if (opts?.search?.trim()) {
    const search = opts.search.trim()
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  return where
}

async function spendingByUserIds(userIds: string[]) {
  const map = new Map<string, { paidOrderCount: number; totalSpent: string }>()
  if (userIds.length === 0) return map

  const groups = await prisma.order.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      paymentStatus: 'PAID',
    },
    _sum: { totalAmount: true },
    _count: { _all: true },
  })

  for (const g of groups) {
    if (!g.userId) continue
    map.set(g.userId, {
      paidOrderCount: g._count._all,
      totalSpent: (g._sum.totalAmount ?? 0).toFixed(2),
    })
  }
  return map
}

export type AdminCustomerListRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  orderCount: number
  loyaltyPointsBalance: number
  wholesaleApprovalStatus: string
}

function toSafeListRow(user: {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive: boolean
  createdAt: Date
  loyaltyPointsBalance: number
  wholesaleApprovalStatus: string
  _count: { orders: number }
}): AdminCustomerListRow {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    orderCount: user._count.orders,
    loyaltyPointsBalance: user.loyaltyPointsBalance,
    wholesaleApprovalStatus: user.wholesaleApprovalStatus,
  }
}

export async function listAdminCustomers(opts?: {
  limit?: number
  search?: string
  role?: Role | 'ALL'
  status?: 'active' | 'inactive' | 'all'
}) {
  const limit = opts?.limit && Number.isFinite(opts.limit) ? Math.min(100, Math.max(1, opts.limit)) : 50

  const where = buildCustomerWhere(opts)

  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      loyaltyPointsBalance: true,
      wholesaleApprovalStatus: true,
      _count: { select: { orders: true } },
    },
  })

  return rows.map(toSafeListRow)
}

export async function getAdminCustomerById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      contactEmail: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      loyaltyPointsBalance: true,
      wholesaleApprovalStatus: true,
      businessName: true,
      abn: true,
      approvedAt: true,
      lastLoginAt: true,
      adminNotes: true,
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
        },
      },
    },
  })

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Account not found.',
    })
  }

  const spendingMap = await spendingByUserIds([userId])
  const spending = spendingMap.get(userId) ?? { paidOrderCount: 0, totalSpent: '0.00' }

  const lastPaidOrder = await prisma.order.findFirst({
    where: { userId, paymentStatus: 'PAID' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, totalAmount: true },
  })

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    contactEmail: user.contactEmail,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    loyaltyPointsBalance: user.loyaltyPointsBalance,
    wholesaleApprovalStatus: user.wholesaleApprovalStatus,
    businessName: user.businessName,
    abn: user.abn,
    approvedAt: user.approvedAt?.toISOString() ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    adminNotes: user.adminNotes ?? '',
    orderCount: user._count.orders,
    spending: {
      paidOrderCount: spending.paidOrderCount,
      totalSpentAud: spending.totalSpent,
      lastPaidOrderAt: lastPaidOrder?.createdAt.toISOString() ?? null,
      lastPaidOrderTotal: lastPaidOrder ? lastPaidOrder.totalAmount.toFixed(2) : null,
    },
    orders: user.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount.toFixed(2),
    })),
  }
}

export async function setAdminCustomerActive(userId: string, isActive: boolean) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, firstName: true, lastName: true },
  })

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Account not found.',
    })
  }

  if (user.role === 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      code: 'CANNOT_MODIFY_ADMIN',
      message: 'Administrator accounts cannot be deactivated from the customer screen.',
    })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      loyaltyPointsBalance: true,
      wholesaleApprovalStatus: true,
      _count: { select: { orders: true } },
    },
  })

  return toSafeListRow(updated)
}

export async function updateAdminCustomerNotes(userId: string, adminNotes: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Account not found.',
    })
  }

  if (user.role === 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      code: 'CANNOT_MODIFY_ADMIN',
      message: 'Administrator accounts are not managed here.',
    })
  }

  const trimmed = adminNotes.trim()
  if (trimmed.length > ADMIN_NOTES_MAX) {
    throw new ApiError({
      statusCode: 400,
      code: 'NOTES_TOO_LONG',
      message: `Notes must be ${ADMIN_NOTES_MAX} characters or fewer.`,
    })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { adminNotes: trimmed || null },
  })

  return { adminNotes: trimmed }
}

export type AdminCustomerExportRow = AdminCustomerListRow & {
  totalSpentAud: string
  paidOrderCount: number
}

export async function exportAdminCustomersCsv(opts?: {
  search?: string
  role?: Role | 'ALL'
  status?: 'active' | 'inactive' | 'all'
}) {
  const where = buildCustomerWhere(opts)
  const rows = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      loyaltyPointsBalance: true,
      wholesaleApprovalStatus: true,
      _count: { select: { orders: true } },
    },
  })

  const spendingMap = await spendingByUserIds(rows.map((r) => r.id))
  const exportRows: AdminCustomerExportRow[] = rows.map((u) => {
    const base = toSafeListRow(u)
    const spend = spendingMap.get(u.id) ?? { paidOrderCount: 0, totalSpent: '0.00' }
    return { ...base, paidOrderCount: spend.paidOrderCount, totalSpentAud: spend.totalSpent }
  })

  const header = toCsvRow([
    'first_name',
    'last_name',
    'email',
    'role',
    'status',
    'signed_up',
    'order_count',
    'paid_orders',
    'total_spent_aud',
    'loyalty_points',
    'wholesale_status',
  ])

  const lines = exportRows.map((r) =>
    toCsvRow([
      r.firstName,
      r.lastName,
      r.email,
      r.role,
      r.isActive ? 'active' : 'inactive',
      r.createdAt.slice(0, 10),
      r.orderCount,
      r.paidOrderCount,
      r.totalSpentAud,
      r.loyaltyPointsBalance,
      r.wholesaleApprovalStatus,
    ]),
  )

  return [header, ...lines].join('\r\n')
}
