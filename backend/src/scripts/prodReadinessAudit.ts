import 'dotenv/config'
import { prisma } from '../config/prisma'
import { env } from '../config/env'

const REQUIRED = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'TOTP_ENCRYPTION_KEY',
  'FRONTEND_ORIGIN',
  'FRONTEND_PUBLIC_URL',
  'AUTH_COOKIE_SECURE',
  'AUTH_COOKIE_SAMESITE',
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM_NAME',
  'MAIL_FROM_EMAIL',
  'ADMIN_NOTIFICATION_EMAIL',
] as const

const OPTIONAL = ['SQUARE_WEBHOOK_SIGNATURE_KEY', 'JWT_REFRESH_SECRET', 'SQUARE_APPLICATION_ID'] as const

function present(name: string): boolean {
  const v = process.env[name]
  return Boolean(v && v.trim() && !v.includes('placeholder') && !v.startsWith('REPLACE_'))
}

async function main() {
  console.log('=== ENV AUDIT (values not printed) ===')
  for (const k of REQUIRED) {
    const ok = present(k)
    console.log(`${ok ? 'OK' : 'MISSING/PLACEHOLDER'}: ${k}`)
  }
  for (const k of OPTIONAL) {
    const v = process.env[k]
    const ok = v && v.trim()
    console.log(`${ok ? 'SET' : 'NOT_SET'}: ${k}${k === 'JWT_REFRESH_SECRET' ? ' (not used by app)' : ''}`)
  }

  console.log('\n=== DB CONNECT ===')
  await prisma.$queryRaw`SELECT 1`
  console.log('DB: connected')

  const [products, orders, events, coupons, users, testimonials] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.event.count(),
    prisma.discountCoupon.count(),
    prisma.user.count(),
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::bigint AS count FROM "Testimonial"`.catch(
      () => [{ count: BigInt(-1) }],
    ),
  ])

  console.log('\n=== DATA COUNTS ===')
  console.log(`products: ${products}`)
  console.log(`orders: ${orders}`)
  console.log(`events: ${events}`)
  console.log(`coupons: ${coupons}`)
  console.log(`users: ${users}`)
  console.log(
    `testimonials: ${testimonials[0]?.count === BigInt(-1) ? 'n/a' : String(testimonials[0]?.count ?? 0)}`,
  )

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, isActive: true },
  })
  console.log(`admin accounts: ${admins.map((a) => a.email).join(', ') || 'none'}`)

  console.log('\n=== RUNTIME CONFIG ===')
  console.log(`FRONTEND_ORIGIN: ${env.FRONTEND_ORIGIN ?? 'unset'}`)
  console.log(`SQUARE configured: ${Boolean(env.SQUARE_ACCESS_TOKEN && env.SQUARE_LOCATION_ID)}`)
  console.log(`SMTP configured: ${Boolean(env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM_EMAIL)}`)
  console.log(`Webhook key: ${env.SQUARE_WEBHOOK_SIGNATURE_KEY ? 'set' : 'pending'}`)
}

main()
  .catch((e) => {
    console.error('AUDIT_FAILED:', (e as Error).message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
