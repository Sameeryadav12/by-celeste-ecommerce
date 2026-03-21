import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma ORM v7: database URL lives here for CLI (migrate, generate, etc.), not in schema.prisma
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
