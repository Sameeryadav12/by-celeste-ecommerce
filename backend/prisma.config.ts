import dotenv from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prefer `backend/.env` over any inherited machine `DATABASE_URL` (Windows user env often breaks local dev).
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

const buildTimeFallbackDatabaseUrl = 'postgresql://build:build@127.0.0.1:5432/build_placeholder?schema=public'

// Runtime (Railway/Render): pooled Supabase URL in DATABASE_URL (port 6543 + pgbouncer).
// Migrations: DIRECT_URL when set (Supabase Session pooler on pooler host, port 5432).
// Do not use db.*.supabase.co direct IPv6 URLs on Railway — use pooler.*.supabase.com only.
const datasourceUrl =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL ||
  buildTimeFallbackDatabaseUrl

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: datasourceUrl,
  },
})
