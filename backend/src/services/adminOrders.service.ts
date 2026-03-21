import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'

export async function listAdminOrders(opts?: { limit?: number }) {
  const limit = opts?.limit && Number.isFinite(opts.limit) ? Math.min(50, Math.max(1, opts.limit)) : 20

  const rows = await prisma.order.findMany({
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

