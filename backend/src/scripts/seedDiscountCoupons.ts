import 'dotenv/config'
import { prisma } from '../config/prisma'

const DEMO_COUPON = {
  code: 'BIRTHDAY20',
  percentage: 20,
  isActive: true,
  appliesToCustomers: true,
  appliesToWholesale: false,
  perCustomerLimit: 1,
  totalUsageLimit: 200,
} as const

/** Idempotent seed for the BIRTHDAY20 demo coupon. Never duplicates rows. */
export async function runDiscountCouponsSeed() {
  const existing = await prisma.discountCoupon.findUnique({
    where: { code: DEMO_COUPON.code },
  })

  if (existing) {
    await prisma.discountCoupon.update({
      where: { id: existing.id },
      data: {
        percentage: DEMO_COUPON.percentage,
        isActive: DEMO_COUPON.isActive,
        appliesToCustomers: DEMO_COUPON.appliesToCustomers,
        appliesToWholesale: DEMO_COUPON.appliesToWholesale,
        perCustomerLimit: DEMO_COUPON.perCustomerLimit,
        totalUsageLimit: DEMO_COUPON.totalUsageLimit,
      },
    })
    // eslint-disable-next-line no-console
    console.log(`[seedDiscountCoupons] Refreshed demo coupon: ${DEMO_COUPON.code}`)
    return
  }

  await prisma.discountCoupon.create({
    data: {
      code: DEMO_COUPON.code,
      percentage: DEMO_COUPON.percentage,
      isActive: DEMO_COUPON.isActive,
      appliesToCustomers: DEMO_COUPON.appliesToCustomers,
      appliesToWholesale: DEMO_COUPON.appliesToWholesale,
      perCustomerLimit: DEMO_COUPON.perCustomerLimit,
      totalUsageLimit: DEMO_COUPON.totalUsageLimit,
    },
  })
  // eslint-disable-next-line no-console
  console.log(`[seedDiscountCoupons] Created demo coupon: ${DEMO_COUPON.code}`)
}

async function main() {
  try {
    await runDiscountCouponsSeed()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /seedDiscountCoupons\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
