import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'

const DEFAULT_EMAIL = 'wholesale@byceleste.com'
const DEFAULT_PASSWORD = 'Wholesale123!'

function demoAdminBundleEnabled() {
  const v = (process.env.DEMO_ADMIN_ENABLED || '').trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

/**
 * Idempotent approved wholesale account for demos (local + optional Render).
 * Runs when DEMO_ADMIN_ENABLED is set (e.g. npm run seed:demo-admin) or SEED_DEMO_USERS=true.
 */
export async function runWholesaleDemoSeed() {
  const deployDemo = (process.env.SEED_DEMO_USERS || '').trim().toLowerCase() === 'true'

  if (!demoAdminBundleEnabled() && !deployDemo) {
    return
  }

  const email = (process.env.DEMO_WHOLESALE_EMAIL || DEFAULT_EMAIL).trim().toLowerCase()
  const password = process.env.DEMO_WHOLESALE_PASSWORD || DEFAULT_PASSWORD
  const firstName = (process.env.DEMO_WHOLESALE_FIRSTNAME || 'Demo').trim() || 'Demo'
  const lastName = (process.env.DEMO_WHOLESALE_LASTNAME || 'Wholesale').trim() || 'Wholesale'
  const businessName = (process.env.DEMO_WHOLESALE_BUSINESS || 'Demo Wholesale Co.').trim()

  if (!email || !password) {
    throw new Error('Wholesale demo seed misconfigured: missing email or password.')
  }

  const passwordHash = await hashPassword(password)
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName,
        lastName,
        passwordHash,
        role: 'WHOLESALE',
        isActive: true,
        wholesaleApprovalStatus: 'APPROVED',
        businessName: businessName || existing.businessName,
        approvedAt: new Date(),
      },
    })
    console.log(`[seedWholesaleDemo] Demo wholesale user ensured (password + approval refreshed): ${email}`)
    return
  }

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: 'WHOLESALE',
      isActive: true,
      wholesaleApprovalStatus: 'APPROVED',
      businessName: businessName || 'Demo Wholesale Co.',
      approvedAt: new Date(),
    },
  })

  console.log(`[seedWholesaleDemo] Created demo wholesale user: ${email}`)
}

async function main() {
  try {
    process.env.SEED_DEMO_USERS = 'true'
    await runWholesaleDemoSeed()
  } finally {
    await prisma.$disconnect()
  }
}

const entry = (process.argv[1] ?? '').replace(/\\/g, '/')
if (/(^|\/)seedWholesaleDemo\.(ts|js|mjs|cjs)$/.test(entry)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
