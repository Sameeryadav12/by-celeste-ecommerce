import {
  LoyaltyTransactionType,
  OrderPaymentStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client'
import { prisma } from '../config/prisma'

/**
 * Jane-friendly rule: **1 loyalty point per whole Australian dollar** of the **order total**
 * (subtotal + shipping), counted after the order is **fully paid**.
 *
 * Examples: $45.20 → 45 points, $120.00 → 120 points, $0.50 → 0 points.
 */
export function pointsEarnedForPaidOrderTotal(totalAmount: Prisma.Decimal): number {
  const aud = Number(totalAmount)
  if (!Number.isFinite(aud) || aud <= 0) return 0
  return Math.floor(aud)
}

export const LOYALTY_EARN_RULE_SUMMARY =
  'You earn 1 point for each whole Australian dollar of your order total once payment is confirmed.'

/**
 * Called only after Square webhook has set the order to PAID (verified payment).
 * - Guest checkout (`userId` null): no points.
 * - Idempotent: partial unique index on (orderId) WHERE type=EARNED, plus try/catch P2002.
 */
export async function awardLoyaltyForPaidOrderIfEligible(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        status: true,
        totalAmount: true,
      },
    })

    if (!order?.userId) return
    if (order.paymentStatus !== OrderPaymentStatus.PAID || order.status !== OrderStatus.PAID) {
      return
    }

    const points = pointsEarnedForPaidOrderTotal(order.totalAmount)
    if (points <= 0) return

    try {
      await tx.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: LoyaltyTransactionType.EARNED,
          pointsChange: points,
          description: `${points} point(s) for paid order total (1 pt per whole AUD dollar).`,
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return
      }
      throw e
    }

    await tx.user.update({
      where: { id: order.userId },
      data: { loyaltyPointsBalance: { increment: points } },
    })
  })
}
