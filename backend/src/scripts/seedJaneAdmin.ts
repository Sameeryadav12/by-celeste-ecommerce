import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'
import { BUSINESS_DETAILS } from '../config/businessDetails'

const ADMIN_EMAIL = BUSINESS_DETAILS.adminEmail.trim().toLowerCase()
const DEFAULT_TEMP_PASSWORD = 'ByCeleste2026!'

export async function runJaneAdminSeed() {
  const password = (
    process.env.ADMIN_PASSWORD ||
    process.env.JANE_ADMIN_PASSWORD ||
    DEFAULT_TEMP_PASSWORD
  ).trim()
  if (!password || password.length < 10) {
    throw new Error('ADMIN_PASSWORD (or JANE_ADMIN_PASSWORD) must be at least 10 characters.')
  }

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })

  if (existing) {
    if (existing.role !== 'ADMIN') {
      throw new Error(
        `[seedJaneAdmin] ${ADMIN_EMAIL} already exists with role ${existing.role}. Resolve manually before seeding.`,
      )
    }
    console.log(`[seedJaneAdmin] Production admin already exists (not duplicated): ${ADMIN_EMAIL}`)
    return { email: ADMIN_EMAIL, created: false }
  }

  const passwordHash = await hashPassword(password)
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Celeste',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log(`[seedJaneAdmin] Created production admin: ${ADMIN_EMAIL}`)
  return { email: ADMIN_EMAIL, created: true }
}

async function main() {
  try {
    await runJaneAdminSeed()
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
