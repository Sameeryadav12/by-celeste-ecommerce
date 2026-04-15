import 'dotenv/config'

/**
 * One command for a fresh laptop: demo content file + catalog + events + demo users.
 * Idempotent for Postgres rows (upserts). Overwrites `data/content/content.json`.
 *
 * Run from `backend/`: npm run seed:local
 * Requires: DATABASE_URL, migrations already applied (`npx prisma migrate dev`).
 */
async function main() {
  process.env.DEMO_ADMIN_ENABLED = 'true'
  const { prisma } = await import('../config/prisma')
  const { resetLocalContentFileToDefaults } = await import('../services/contentStore')
  const { runSeedCatalog } = await import('./seedCatalog')
  const { runSeedEvents } = await import('./seedEvents')
  const { runAdminSeed } = await import('./seedAdmin')
  const { runWholesaleDemoSeed } = await import('./seedWholesaleDemo')

  try {
    // eslint-disable-next-line no-console
    console.log('[seed:local] Writing default testimonials + marketing/theme/business to data/content/content.json …')
    await resetLocalContentFileToDefaults()
    // eslint-disable-next-line no-console
    console.log('[seed:local] Seeding categories, ingredients, products …')
    await runSeedCatalog()
    // eslint-disable-next-line no-console
    console.log('[seed:local] Seeding events …')
    await runSeedEvents()
    // eslint-disable-next-line no-console
    console.log('[seed:local] Seeding demo admin + approved wholesale users …')
    await runAdminSeed()
    await runWholesaleDemoSeed()
    // eslint-disable-next-line no-console
    console.log('[seed:local] Finished.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
