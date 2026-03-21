# Contributing

## Repo layout

- **`frontend/`** — Vite + React storefront (`npm run dev`, `npm run build`).
- **`backend/`** — Express API + Prisma (`npm run dev`, `npm run build`).
- **`docs/`** — Behaviour and deployment notes.

## Before you open a PR

1. **Never commit** `.env`, `.env.local`, or real API keys (see root `.gitignore`).
2. Run **production builds** locally:
   - `cd backend && npm run build`
   - `cd frontend && npm run build`
3. Optional: `npm run lint` in each package (some legacy lint noise may remain).

## Database

Local changes to the schema belong in Prisma migrations under `backend/prisma/migrations/`.

## Deployment

See **`docs/DEPLOYMENT.md`** and root **`README.md`** for Vercel + Render + Postgres.
