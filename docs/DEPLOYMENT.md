# Deployment checklist (Vercel + Render + Postgres)

Use this when moving from local development to **Vercel (frontend)** and **Render (backend + Postgres)**. Nothing here runs automatically; it is a manual checklist.

## 1. Secrets & files

- [ ] No `.env` files committed (`git check-ignore` / inspect `git status`).
- [ ] `frontend/public/images/reference/` is empty or absent from git (see root `.gitignore`).
- [ ] `JWT_ACCESS_SECRET`, `DATABASE_URL`, and Square keys exist only in host dashboards.

## 2. PostgreSQL

- [ ] Create a Postgres instance (e.g. Render Postgres).
- [ ] Copy **internal** or **external** connection string into Render service `DATABASE_URL`.

## 3. Backend (Render)

**Root directory:** `backend`

| Setting | Example |
|---------|---------|
| Build | `npm install && npm run build && npx prisma generate` |
| Start | `npx prisma migrate deploy && npm start` |

**Environment variables** (mirror `backend/.env.example`):

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | Often set by Render (e.g. `10000`) |
| `DATABASE_URL` | From Postgres |
| `FRONTEND_ORIGIN` | Exact Vercel URL, no trailing slash |
| `JWT_ACCESS_SECRET` | Strong random string |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_SAMESITE` | `lax` if same-site; `none` if cross-subdomain + `Secure` |
| `CHECKOUT_SUCCESS_REDIRECT_URL` | `https://<vercel-app>/checkout/success` |
| Square vars | As required for sandbox or production |

**CORS:** `FRONTEND_ORIGIN` must match the browser origin calling the API or requests will be blocked.

## 4. Frontend (Vercel)

**Root directory:** `frontend`

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com` (no trailing slash) |

Do **not** rely on `localhost` in production builds.

## 5. Square Dashboard

- [ ] Hosted checkout / redirect URLs include your production storefront domain.
- [ ] Webhook URL exactly matches `SQUARE_WEBHOOK_NOTIFICATION_URL` (path `/api/webhooks/square`).
- [ ] Signature key matches `SQUARE_WEBHOOK_SIGNATURE_KEY`.

## 6. Smoke tests after deploy

- [ ] `GET https://<api>/health`
- [ ] Shop loads products from API (network tab: correct base URL, CORS OK).
- [ ] Sign up / login (cookies: `Secure`, `SameSite` as expected).
- [ ] Checkout happy path (sandbox) and success redirect URL.

## 7. Monorepo note

This repo keeps **two deployables** in one GitHub project: set **root directory** separately on Vercel and Render so each service only builds its half.

## 8. Render Blueprint (optional)

The repo root includes **`render.yaml`** — you can create a **Blueprint** on Render and connect this repository to provision a **Web Service** for the API (`backend/`). You must still:

- Attach or create a **PostgreSQL** database and set `DATABASE_URL`.
- Add all secrets from `backend/.env.example` in the Render dashboard.

The blueprint does **not** auto-fill Square or JWT secrets.

## 9. GitHub repository

Canonical remote: **https://github.com/Sameeryadav12/by-celeste-ecommerce**

After cloning, copy env examples before running locally:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local   # optional for local dev
```
