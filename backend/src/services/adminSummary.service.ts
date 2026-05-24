import { prisma } from '../config/prisma'
import { OrderPaymentStatus, Role, WholesaleApprovalStatus } from '@prisma/client'
import { getAdminSquareReadiness } from '../utils/adminSquareReadiness'

export const LOW_STOCK_THRESHOLD = 5

export async function getAdminSummary() {
  const now = new Date()

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    paidOrders,
    upcomingEvents,
    pendingWholesaleApplications,
    lowStockProducts,
  ] = await Promise.all([
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
    prisma.user.count({
      where: {
        role: Role.WHOLESALE,
        wholesaleApprovalStatus: WholesaleApprovalStatus.PENDING,
      },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: LOW_STOCK_THRESHOLD },
      },
      orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
      take: 20,
      select: { id: true, name: true, stockQuantity: true },
    }),
  ])

  const square = getAdminSquareReadiness()

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    paidOrders,
    upcomingEvents,
    pendingWholesaleApplications,
    square: {
      connected: square.connected,
      missingEnv: square.missingEnv,
    },
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      stockQuantity: p.stockQuantity,
    })),
  }
}

