import 'dotenv/config'
import { prisma } from '../config/prisma'

/**
 * Permanently deletes all events from the database.
 *
 * Run: npm run db:purge-events
 */
export async function purgeEvents() {
  const before = await prisma.event.count()
  if (before === 0) {
    console.log('[purgeEvents] No events found.')
    return { deleted: 0 }
  }

  const deleted = await prisma.event.deleteMany()
  console.log(`[purgeEvents] Removed ${deleted.count} event(s).`)
  return { deleted: deleted.count }
}

async function main() {
  try {
    await purgeEvents()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /purgeEvents\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
