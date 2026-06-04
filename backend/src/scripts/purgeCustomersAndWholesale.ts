import 'dotenv/config'
import { Role } from '@prisma/client'
import { prisma } from '../config/prisma'

const ROLES_TO_PURGE: Role[] = ['CUSTOMER', 'WHOLESALE']

/**
 * Removes all retail and wholesale accounts and their related data.
 * Admin users, catalogue, events, and coupons are kept.
 *
 * Run: npm run db:purge-customers-wholesale
 */
export async function purgeCustomersAndWholesale() {
  const targets = await prisma.user.findMany({
    where: { role: { in: ROLES_TO_PURGE } },
    select: { id: true, email: true, role: true },
  })

  if (targets.length === 0) {
    console.log('[purgeCustomersAndWholesale] No CUSTOMER or WHOLESALE users found.')
    return { users: 0, orders: 0, couponUsages: 0 }
  }

  const userIds = targets.map((u) => u.id)
  const emails = targets.map((u) => u.email.trim().toLowerCase())

  const result = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.deleteMany({
      where: {
        OR: [{ userId: { in: userIds } }, { email: { in: emails, mode: 'insensitive' } }],
      },
    })

    const couponUsages = await tx.discountCouponUsage.deleteMany({
      where: { userId: { in: userIds } },
    })

    const users = await tx.user.deleteMany({
      where: { id: { in: userIds } },
    })

    return { users: users.count, orders: orders.count, couponUsages: couponUsages.count }
  })

  const byRole = targets.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  console.log('[purgeCustomersAndWholesale] Removed:')
  console.log(`  users: ${result.users} (${JSON.stringify(byRole)})`)
  console.log(`  orders: ${result.orders}`)
  console.log(`  coupon usages: ${result.couponUsages}`)

  return result
}

async function main() {
  try {
    await purgeCustomersAndWholesale()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /purgeCustomersAndWholesale\.(ts|js)$/.test(
  (process.argv[1] ?? '').replace(/\\/g, '/'),
)
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
