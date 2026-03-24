# By Celeste — E-commerce Platform

[![CI](https://github.com/Sameeryadav12/by-celeste-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/Sameeryadav12/by-celeste-ecommerce/actions/workflows/ci.yml)

**Repository:** [github.com/Sameeryadav12/by-celeste-ecommerce](https://github.com/Sameeryadav12/by-celeste-ecommerce)

Full-stack e-commerce site for **By Celeste**, an Australian skincare brand: storefront, cart, Square checkout, customer accounts, loyalty, wholesale applications, events, and an admin dashboard.

```bash
git clone https://github.com/Sameeryadav12/by-celeste-ecommerce.git
cd by-celeste-ecommerce
```

## Tech stack

| Layer | Stack |
|--------|--------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, React Router |
| **Backend** | Node.js, Express 5, TypeScript, Zod |
| **Database** | PostgreSQL (Prisma ORM) |
| **Payments** | Square (hosted checkout + webhooks) |

## Key features

- Product catalog with categories, ingredients, and wholesale pricing
- Cart, postcode-based shipping preview, and checkout
- JWT auth with HTTP-only cookies; customer dashboard, orders, loyalty points
- Wholesale application flow and role-based pricing
- Events (list, detail, calendar export, maps link)
- Admin dashboard for products, categories, ingredients, events, orders
- SEO metadata and structured data on key pages

## Repository layout

```
├── frontend/          # Vite + React storefront
├── backend/         # Express API + Prisma
├── docs/              # Plain-English docs (see docs/README.md)
├── .github/workflows/ # CI: backend + frontend production builds
├── render.yaml        # Optional Render Blueprint (API service)
├── CONTRIBUTING.md
├── LICENSE
├── Perplexity.txt     # UX analysis notes (optional context)
└── README.md          # This file
```

## Local development

### Prerequisites

- Node.js 20+ recommended  
- PostgreSQL (local or Docker)  
- npm (or pnpm/yarn if you adapt commands)

### 1. Database

Create a database and set `DATABASE_URL` in `backend/.env` (see `backend/.env.example`).

### 2. Backend

```bash
cd backend
cp .env.example .env   # then edit with real values
npm install
npx prisma migrate dev
npx prisma generate
npm run seed:catalog     # optional: sample catalog
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # optional; leave empty to use Vite /api proxy
npm install
npm run dev                  # http://localhost:5173
```

In development, the Vite dev server **proxies** `/api` to `http://localhost:4000`, so you usually **do not** need `VITE_API_BASE_URL` locally.

### Useful scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Backend | `npm run build` | Compile TypeScript → `dist/` |
| Backend | `npm start` | Run `node dist/server.js` |
| Backend | `npm run prisma:migrate:deploy` | Apply migrations (production) |
| Frontend | `npm run build` | Production bundle → `dist/` |
| Frontend | `npm run preview` | Preview production build locally |

---

## Deployment overview (not run automatically)

Target setup discussed for this project:

| Component | Suggested host |
|-----------|----------------|
| **Frontend** | [Vercel](https://vercel.com) (project **root directory**: `frontend`) |
| **Backend** | [Render](https://render.com) Web Service (**root directory**: `backend`) |
| **Database** | [Render PostgreSQL](https://render.com/docs/databases) or any managed Postgres |

### Frontend (Vercel)

1. New project → import repo → set **Root Directory** to `frontend`.  
2. **Build command:** `npm run build`  
3. **Output directory:** `dist`  
4. **Environment variable:**  
   - `VITE_API_BASE_URL` = your Render API URL, e.g. `https://by-celeste-api.onrender.com` (no trailing slash)

`frontend/vercel.json` adds SPA rewrites so client-side routes work.

### Backend (Render)

1. New **Web Service** → connect repo → **Root Directory** `backend`.  
2. **Build command:** `npm install --include=dev && npm run build && npx prisma generate`  
   - Installs devDependencies required for TypeScript + @types during build.
3. **Start command:** `npm run start:render`  
   - Runs migrations and idempotent catalog/events seeds, then starts the API.
4. Set all variables from `backend/.env.example` using **production** values.

**Critical production variables**

- `DATABASE_URL` — Render Postgres internal or external URL  
- `FRONTEND_ORIGIN` — exact Vercel URL, e.g. `https://your-app.vercel.app` (CORS + cookies)  
- `JWT_ACCESS_SECRET` — long random string  
- `AUTH_COOKIE_SECURE=true`  
- If frontend and API are on **different domains**, cookies for cross-site auth typically need `AUTH_COOKIE_SAMESITE=none` (and `Secure` — see Prisma/backend cookie middleware).

### Square (production)

Configure in the Square Developer Dashboard:

- Redirect / success URL aligned with `CHECKOUT_SUCCESS_REDIRECT_URL`  
- Webhook URL: `https://<your-render-host>/api/webhooks/square` matching `SQUARE_WEBHOOK_NOTIFICATION_URL`  
- Use production tokens and `SQUARE_ENVIRONMENT=production` when going live  

See `backend/.env.example` for placeholders.

---

## Security & Git hygiene

- **Never commit** `.env`, real tokens, or database URLs with passwords.  
- The **`frontend/public/images/reference/`** folder is **gitignored** — it is for internal competitor/reference images only.  
- Run `git status` before pushing; if reference files were ever committed, remove them from history or run `git rm -r --cached frontend/public/images/reference` after pulling `.gitignore`.

---

## Documentation

- **Index:** [`docs/README.md`](./docs/README.md)
- **Overview:** [`docs/01-overview.md`](./docs/01-overview.md)
- **Deployment checklist:** [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs **`npm run build`** for `backend/` and `frontend/` on pushes and PRs to `main` / `master`.

The **backend** job sets a placeholder `DATABASE_URL` so `prisma generate` (via `npm ci` postinstall) can read `prisma.config.ts` without a checked-in `.env`. This does not affect your app — production still uses real env vars on Render.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — adjust if your institution requires another license.
