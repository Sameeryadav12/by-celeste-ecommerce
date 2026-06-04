# Railway + Supabase database connection

## Problem

Railway logs like:

```text
connect ENETUNREACH ... :5432
Invalid prisma.product.findMany()
```

Usually means the backend is using Supabase **direct** connection (`db.<project>.supabase.co`). That host is often **IPv6-only**. Railway may not reach it.

## Fix (no data wipe)

Use Supabase **pooler** URLs only. Keep products and all data.

### 1. Supabase dashboard

**Project Settings → Database → Connection pooling**

Copy:

| Use | Pooler mode | Port | Railway variable |
|-----|-------------|------|------------------|
| App runtime (Prisma queries) | **Transaction** | **6543** | `DATABASE_URL` |
| Migrations (`prisma migrate deploy`) | **Session** | **5432** | `DIRECT_URL` |

Do **not** paste the “Direct connection” `db.*.supabase.co` string into Railway.

### 2. URL format (replace placeholders — do not commit real passwords)

**`DATABASE_URL` (runtime, pooled transaction):**

```text
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**`DIRECT_URL` (migrations only, session pooler):**

```text
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

Notes:

- Username is often `postgres.PROJECT_REF` (not only `postgres`). Use the exact URI from Supabase.
- Host must be `*.pooler.supabase.com`, not `db.*.supabase.co`.
- Always include `sslmode=require`.
- Transaction pooler needs `pgbouncer=true` on `DATABASE_URL`.

### 3. Railway variables

On the **backend** service:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Transaction pooler URI (port **6543**) |
| `DIRECT_URL` | Session pooler URI (port **5432**, pooler host) |

Leave other env vars unchanged.

### 4. Deploy steps

1. Save variables in Railway.
2. Redeploy backend (or run deploy command).
3. Confirm build runs: `npx prisma migrate deploy` (uses `DIRECT_URL` when set).
4. Test: `https://by-celeste-api-production.up.railway.app/api/products` → JSON, not 500.

### 5. Local `.env`

Keep Docker/local `DATABASE_URL` for dev. Do not commit production URLs.

## How this repo wires URLs

| Layer | URL |
|-------|-----|
| `backend/src/config/prisma.ts` | `DATABASE_URL` (pooled runtime) |
| `backend/prisma.config.ts` | `DIRECT_URL` if set, else `DATABASE_URL` (migrations) |

## Checklist

- [ ] `DATABASE_URL` uses `pooler.supabase.com` and port **6543**
- [ ] `DIRECT_URL` uses `pooler.supabase.com` and port **5432**
- [ ] Both include `sslmode=require`
- [ ] No `db.*.supabase.co` in Railway env
- [ ] Redeploy + `/api/products` returns 200
