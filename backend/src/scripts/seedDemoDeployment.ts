import 'dotenv/config'

/**
 * Optional Render / production demo bootstrap.
 * Runs only when SEED_DEMO_USERS=true (set in dashboard for review demos; omit for real production).
 */
async function main() {
  if ((process.env.SEED_DEMO_USERS || '').trim().toLowerCase() !== 'true') {
    // eslint-disable-next-line no-console
    console.log('[seedDemoDeployment] Skipped (SEED_DEMO_USERS is not true).')
    return
  }

  const { prisma } = await import('../config/prisma')
  process.env.DEMO_ADMIN_ENABLED = 'true'

  try {
    const { runAdminSeed } = await import('./seedAdmin')
    const { runWholesaleDemoSeed } = await import('./seedWholesaleDemo')
    await runAdminSeed()
    await runWholesaleDemoSeed()
    // eslint-disable-next-line no-console
    console.log('[seedDemoDeployment] Demo admin + wholesale users ensured.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
