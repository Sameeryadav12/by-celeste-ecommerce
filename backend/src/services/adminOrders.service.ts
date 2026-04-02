import { OrderPaymentStatus, OrderStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'

export async function listAdminOrders(opts?: {
  limit?: number
  search?: string
  status?: OrderStatus
  paymentStatus?: OrderPaymentStatus
}) {
  const limit = opts?.limit && Number.isFinite(opts.limit) ? Math.min(50, Math.max(1, opts.limit)) : 20

  const where: {
    status?: OrderStatus
    paymentStatus?: OrderPaymentStatus
    OR?: Array<{
      firstName?: { contains: string; mode: 'insensitive' }
      lastName?: { contains: string; mode: 'insensitive' }
      email?: { contains: string; mode: 'insensitive' }
    }>
  } = {}
  if (opts?.status) where.status = opts.status
  if (opts?.paymentStatus) where.paymentStatus = opts.paymentStatus
  if (opts?.search?.trim()) {
    const search = opts.search.trim()
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  return rows.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalAmount: o.totalAmount.toFixed(2),
    customer: {
      email: o.email,
      firstName: o.firstName,
      lastName: o.lastName,
    },
  }))
}

export async function getAdminOrderById(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      items: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          productSlugSnapshot: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          provider: true,
          providerReference: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!order) {
    throw new ApiError({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
      message: 'Order not found.',
    })
  }

  // Admin always sees full details for this order.
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    squarePaymentLinkId: order.squarePaymentLinkId,
    squareOrderId: order.squareOrderId,
    subtotalAmount: order.subtotalAmount.toFixed(2),
    shippingAmount: order.shippingAmount.toFixed(2),
    totalAmount: order.totalAmount.toFixed(2),
    customer: {
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
    },
    shipping: {
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      suburb: order.suburb,
      state: order.state,
      postcode: order.postcode,
      country: order.country,
    },
    notes: order.notes,
    payment: order.payments[0]
      ? {
          provider: order.payments[0].provider,
          providerReference: order.payments[0].providerReference,
          status: order.payments[0].status,
          createdAt: order.payments[0].createdAt.toISOString(),
        }
      : null,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.productNameSnapshot,
      slug: i.productSlugSnapshot,
      unitPrice: i.unitPrice.toFixed(2),
      quantity: i.quantity,
      lineTotal: i.lineTotal.toFixed(2),
    })),
  }
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
      message: 'Order not found.',
    })
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      updatedAt: true,
    },
  })

  return {
    id: updated.id,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    updatedAt: updated.updatedAt.toISOString(),
  }
}

