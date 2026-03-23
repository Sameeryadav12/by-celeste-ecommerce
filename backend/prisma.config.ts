import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const buildTimeFallbackDatabaseUrl = 'postgresql://build:build@127.0.0.1:5432/build_placeholder?schema=public'

// Use DATABASE_URL when provided. Fallback lets prisma generate run in CI/build environments
// that compile code but do not connect to a real database during install.
const datasourceUrl = process.env.DATABASE_URL || buildTimeFallbackDatabaseUrl

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: datasourceUrl,
  },
})
