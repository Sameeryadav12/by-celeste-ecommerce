# New laptop — what to install

- **Node.js** — use LTS twenty plus.
- **npm** — ships with Node already.
- **Git** — clone repo from GitHub.
- **PostgreSQL** — backend needs local database.
- **Editor** — Cursor or VS Code optional.

## Backend errors (`Invalid prisma…findMany`)

- **Start PostgreSQL** — service must be running.
- **Fix `DATABASE_URL`** in `backend/.env` — host, port, database name.
- **Apply migrations** — `cd backend` then `npx prisma migrate dev`.
- **Regenerate client** — `npx prisma generate` after schema changes.
- **Seed catalog** — optional: `npm run seed:catalog` for sample products.

## `P1001` can’t reach `localhost:5433`

- **Docker:** `cd backend`, run `docker compose up -d`, use Docker `DATABASE_URL` in `.env.example`.
- **No Docker:** install Postgres, set port **5432** in `.env` (not 5433), start Windows service.
