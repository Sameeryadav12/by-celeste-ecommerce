import 'dotenv/config'
import { BUSINESS_DETAILS } from '../config/businessDetails'
import { prisma } from '../config/prisma'

const NEW_EMAIL = BUSINESS_DETAILS.adminEmail.trim().toLowerCase()
/** Jane is public support only — never migrated to admin login. */
const LEGACY_ADMIN_EMAILS = ['admin@byceleste.com'] as const

/**
 * Renames legacy admin User rows to admin.byceleste@gmail.com.
 *
 * Run: npm run db:migrate-admin-email
 */
export async function migrateAdminEmail() {
  for (const legacyEmail of LEGACY_ADMIN_EMAILS) {
    if (legacyEmail === NEW_EMAIL) continue

    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } })
    if (!legacy || legacy.role !== 'ADMIN') continue

    const target = await prisma.user.findUnique({ where: { email: NEW_EMAIL } })

    if (target && target.id !== legacy.id) {
      await prisma.user.delete({ where: { id: legacy.id } })
      console.log(`[migrateAdminEmail] Removed duplicate legacy admin: ${legacyEmail}`)
      continue
    }

    await prisma.user.update({
      where: { id: legacy.id },
      data: { email: NEW_EMAIL },
    })
    console.log(`[migrateAdminEmail] Renamed ${legacyEmail} → ${NEW_EMAIL}`)
  }

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true },
  })
  console.log(`[migrateAdminEmail] Admin accounts now: ${admins.map((a) => a.email).join(', ') || '(none)'}`)
}

async function main() {
  try {
    await migrateAdminEmail()
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
