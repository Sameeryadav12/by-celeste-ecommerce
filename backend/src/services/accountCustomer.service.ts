import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { LOYALTY_EARN_RULE_SUMMARY } from './loyalty.service'

function moneyString(d: { toString(): string }) {
  return d.toString()
}

export async function listOrdersForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
    },
  })

  return orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalAmount: moneyString(o.totalAmount),
  }))
}

export async function getOrderDetailForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
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
      message: 'We could not find that order on your account.',
    })
  }

  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalAmount: moneyString(order.subtotalAmount),
    shippingAmount: moneyString(order.shippingAmount),
    totalAmount: moneyString(order.totalAmount),
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
      unitPrice: moneyString(i.unitPrice),
      quantity: i.quantity,
      lineTotal: moneyString(i.lineTotal),
    })),
  }
}

export async function getLoyaltyDashboardForUser(userId: string) {
  const [user, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPointsBalance: true },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        pointsChange: true,
        description: true,
        orderId: true,
        createdAt: true,
      },
    }),
  ])

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
      message: 'Account not found.',
    })
  }

  return {
    balance: user.loyaltyPointsBalance,
    howPointsAreEarned: LOYALTY_EARN_RULE_SUMMARY,
    recentTransactions: recent.map((t) => ({
      id: t.id,
      type: t.type,
      pointsChange: t.pointsChange,
      description: t.description,
      orderId: t.orderId,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}
