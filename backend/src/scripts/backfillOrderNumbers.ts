import 'dotenv/config'
import { prisma } from '../config/prisma'
import { ORDER_NUMBER_START } from '../utils/orderNumber'

/** Ensures every order has a unique orderNumber starting at BC-1000. */
export async function runBackfillOrderNumbers() {
  const missing = await prisma.order.findMany({
    where: { orderNumber: { lte: 0 } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })

  if (missing.length === 0) {
    const count = await prisma.order.count()
    console.log(`[backfillOrderNumbers] OK — ${count} order(s) already numbered.`)
    return
  }

  const agg = await prisma.order.aggregate({ _max: { orderNumber: true } })
  let next = Math.max(ORDER_NUMBER_START, (agg._max.orderNumber ?? ORDER_NUMBER_START - 1) + 1)

  for (const row of missing) {
    await prisma.order.update({
      where: { id: row.id },
      data: { orderNumber: next },
    })
    next += 1
  }

  console.log(`[backfillOrderNumbers] Assigned numbers to ${missing.length} order(s).`)
}

async function main() {
  try {
    await runBackfillOrderNumbers()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /backfillOrderNumbers\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
