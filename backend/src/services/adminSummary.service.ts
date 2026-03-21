import { prisma } from '../config/prisma'
import { OrderPaymentStatus, Role } from '@prisma/client'

export async function getAdminSummary() {
  const now = new Date()

  const [totalProducts, activeProducts, totalOrders, paidOrders, upcomingEvents] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: OrderPaymentStatus.PAID } }),
      prisma.event.count({
        where: {
          isPublished: true,
          endDateTime: { gte: now },
        },
      }),
    ])

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    paidOrders,
    upcomingEvents,
  }
}

