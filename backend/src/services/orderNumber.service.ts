import type { Prisma } from '@prisma/client'
import { ORDER_NUMBER_START } from '../utils/orderNumber'

export async function allocateOrderNumber(tx: Prisma.TransactionClient): Promise<number> {
  const agg = await tx.order.aggregate({ _max: { orderNumber: true } })
  const currentMax = agg._max.orderNumber
  if (currentMax == null) return ORDER_NUMBER_START
  return Math.max(ORDER_NUMBER_START, currentMax + 1)
}
