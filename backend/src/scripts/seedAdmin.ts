import 'dotenv/config'
import { prisma } from '../config/prisma'
import { hashPassword } from '../utils/password'

async function main() {
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || ''
  const firstName = (process.env.ADMIN_BOOTSTRAP_FIRSTNAME || 'Admin').trim()
  const lastName = (process.env.ADMIN_BOOTSTRAP_LASTNAME || 'User').trim()

  if (!email || !password) {
    throw new Error(
      'Missing ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_PASSWORD in your .env file.',
    )
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`[seedAdmin] Admin already exists: ${email}`)
    return
  }

  const passwordHash = await hashPassword(password)

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log(`[seedAdmin] Created admin: ${email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

