import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'
import { BUSINESS_DETAILS } from '../config/businessDetails'

const JANE_EMAIL = BUSINESS_DETAILS.supportEmail.trim().toLowerCase()
const DEFAULT_TEMP_PASSWORD = 'ByCeleste2026!'

export async function runJaneAdminSeed() {
  const password = (process.env.JANE_ADMIN_PASSWORD || DEFAULT_TEMP_PASSWORD).trim()
  if (!password || password.length < 10) {
    throw new Error('JANE_ADMIN_PASSWORD must be at least 10 characters.')
  }

  const existing = await prisma.user.findUnique({ where: { email: JANE_EMAIL } })

  if (existing) {
    if (existing.role !== 'ADMIN') {
      throw new Error(
        `[seedJaneAdmin] ${JANE_EMAIL} already exists with role ${existing.role}. Resolve manually before seeding.`,
      )
    }
    console.log(`[seedJaneAdmin] Jane admin already exists (not duplicated): ${JANE_EMAIL}`)
    return { email: JANE_EMAIL, created: false }
  }

  const passwordHash = await hashPassword(password)
  await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Celeste',
      email: JANE_EMAIL,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log(`[seedJaneAdmin] Created Jane admin: ${JANE_EMAIL}`)
  return { email: JANE_EMAIL, created: true }
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
