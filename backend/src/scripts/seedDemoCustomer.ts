import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'

const DEMO_EMAIL = (process.env.DEMO_CUSTOMER_EMAIL || 'customer@byceleste.com').trim().toLowerCase()
const DEMO_PASSWORD = process.env.DEMO_CUSTOMER_PASSWORD || 'Customer123!'
const DEMO_FIRST = (process.env.DEMO_CUSTOMER_FIRSTNAME || 'Demo').trim()
const DEMO_LAST = (process.env.DEMO_CUSTOMER_LASTNAME || 'Customer').trim()

export async function runDemoCustomerSeed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD)
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`[seedDemoCustomer] Skipped — ${DEMO_EMAIL} is an admin account.`)
      return
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: existing.firstName.trim() ? existing.firstName : DEMO_FIRST,
        lastName: existing.lastName.trim() ? existing.lastName : DEMO_LAST,
        passwordHash,
        role: 'CUSTOMER',
        isActive: true,
        wholesaleApprovalStatus: 'NONE',
      },
    })
    console.log(`[seedDemoCustomer] Demo customer ensured: ${DEMO_EMAIL}`)
    return
  }

  await prisma.user.create({
    data: {
      firstName: DEMO_FIRST,
      lastName: DEMO_LAST,
      email: DEMO_EMAIL,
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
    },
  })
  console.log(`[seedDemoCustomer] Created demo customer: ${DEMO_EMAIL}`)
}

async function main() {
  try {
    await runDemoCustomerSeed()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /seedDemoCustomer\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
