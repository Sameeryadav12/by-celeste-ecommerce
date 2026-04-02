import 'dotenv/config'

/**
 * Idempotent demo admin for local / client demos.
 * Enables demo credentials for this process only (does not modify .env).
 *
 * Default: admin@byceleste.com / Admin123!
 * Override via env: DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD
 */
async function main() {
  process.env.DEMO_ADMIN_ENABLED = 'true'
  const { prisma } = await import('../config/prisma')
  const { runAdminSeed } = await import('./seedAdmin')
  try {
    await runAdminSeed()
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
