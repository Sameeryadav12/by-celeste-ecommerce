import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'

const DEMO_DEFAULT_EMAIL = 'admin@byceleste.com'
const DEMO_DEFAULT_PASSWORD = 'Admin123!'

function demoModeEnabled() {
  const v = (process.env.DEMO_ADMIN_ENABLED || '').trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function runAdminSeed() {
  const demo = demoModeEnabled()

  const email = demo
    ? (process.env.DEMO_ADMIN_EMAIL || DEMO_DEFAULT_EMAIL).trim().toLowerCase()
    : (process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase()

  const password = demo
    ? (process.env.DEMO_ADMIN_PASSWORD || DEMO_DEFAULT_PASSWORD)
    : process.env.ADMIN_BOOTSTRAP_PASSWORD || ''

  const firstName = (demo ? process.env.DEMO_ADMIN_FIRSTNAME : process.env.ADMIN_BOOTSTRAP_FIRSTNAME) ||
    'Admin'
  const lastName = (demo ? process.env.DEMO_ADMIN_LASTNAME : process.env.ADMIN_BOOTSTRAP_LASTNAME) || 'User'

  if (!demo && (!email || !password)) {
    throw new Error(
      'Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in .env, or run npm run seed:demo-admin for the demo account.',
    )
  }

  if (!email || !password) {
    throw new Error('Demo admin seed misconfigured: missing email or password.')
  }

  const passwordHash = await hashPassword(password)
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (demo) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: firstName.trim() || existing.firstName,
          lastName: lastName.trim() || existing.lastName,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
        },
      })
      console.log(`[seedAdmin] Demo admin ensured (password and role refreshed): ${email}`)
      return
    }

    console.log(`[seedAdmin] Admin already exists (unchanged): ${email}`)
    return
  }

  await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log(`[seedAdmin] Created admin: ${email}`)
}

async function main() {
  try {
    await runAdminSeed()
  } finally {
    await prisma.$disconnect()
  }
}

function isSeedAdminCliProcess() {
  const entry = (process.argv[1] ?? '').replace(/\\/g, '/')
  return /(^|\/)seedAdmin\.(ts|js|mjs|cjs)$/.test(entry)
}

if (isSeedAdminCliProcess()) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
