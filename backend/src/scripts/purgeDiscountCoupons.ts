import 'dotenv/config'
import { prisma } from '../config/prisma'

const DEFAULT_CODES = ['DISC', 'BIRTHDAY20'] as const

/**
 * Permanently deletes discount coupons by code (and their usages via cascade).
 *
 * Run: npm run db:purge-discount-coupons
 */
export async function purgeDiscountCoupons(codes: readonly string[] = DEFAULT_CODES) {
  const normalised = [...new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean))]
  if (normalised.length === 0) {
    console.log('[purgeDiscountCoupons] No coupon codes provided.')
    return { deleted: 0, codes: [] as string[] }
  }

  const found = await prisma.discountCoupon.findMany({
    where: { code: { in: normalised } },
    select: { id: true, code: true },
  })

  if (found.length === 0) {
    console.log(`[purgeDiscountCoupons] No coupons found for: ${normalised.join(', ')}`)
    return { deleted: 0, codes: [] as string[] }
  }

  const deleted = await prisma.discountCoupon.deleteMany({
    where: { id: { in: found.map((c) => c.id) } },
  })

  const removedCodes = found.map((c) => c.code)
  console.log('[purgeDiscountCoupons] Removed:')
  console.log(`  coupons: ${deleted.count} (${removedCodes.join(', ')})`)

  const missing = normalised.filter((c) => !removedCodes.includes(c))
  if (missing.length > 0) {
    console.log(`  not found: ${missing.join(', ')}`)
  }

  return { deleted: deleted.count, codes: removedCodes }
}

async function main() {
  const fromCli = process.argv.slice(2).map((c) => c.trim()).filter(Boolean)
  try {
    await purgeDiscountCoupons(fromCli.length > 0 ? fromCli : DEFAULT_CODES)
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /purgeDiscountCoupons\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
