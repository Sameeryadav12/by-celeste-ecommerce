# Deployment guide

How to put **By Celeste** live for **www.byceleste.com**.

**Suggested hosting:** Vercel (website) + Render (API + database).

---

## Overview

| Part | Host | Folder |
|------|------|--------|
| Customer site, admin, wholesale UI | Vercel | `frontend/` |
| API + database | Render | `backend/` |
| Postgres | Render Postgres | — |

---

## 1. Before you deploy

- [ ] No `.env` files in Git (only `.env.example`).
- [ ] Production builds pass: `npm run build` in `backend/` and `frontend/`.
- [ ] Jane admin created with `npm run seed:jane-admin` (not demo admin).
- [ ] `SEED_DEMO_USERS` is **not** set on production.

---

## 2. Database

1. Create a **PostgreSQL** database (e.g. Render Postgres).
2. Copy the connection string into Render **`DATABASE_URL`**.
3. Migrations run on deploy via `npm run start:render` or manually:

```bash
cd backend
npx prisma migrate deploy
```

---

## 3. Backend (Render)

| Setting | Value |
|---------|--------|
| Root directory | `backend` |
| Build | `npm install --include=dev && npm run build && npx prisma generate` |
| Start | `npm run start:render` (migrations + catalog/events seed + server) |

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection |
| `JWT_ACCESS_SECRET` | Auth signing (long random string) |
| `FRONTEND_ORIGIN` | Exact Vercel URL, e.g. `https://www.byceleste.com` |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_SAMESITE` | `lax` if same site; `none` if API and shop on different domains |
| `CHECKOUT_SUCCESS_REDIRECT_URL` | `https://www.byceleste.com/checkout/success` |

### Square (production)

| Variable | Purpose |
|----------|---------|
| `SQUARE_ACCESS_TOKEN` | Production token |
| `SQUARE_LOCATION_ID` | Square location |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Webhook verification |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | `https://YOUR-API-HOST/api/webhooks/square` |
| `SQUARE_ENVIRONMENT` | `production` |

In Square Developer Dashboard:

- Webhook URL must **match** `SQUARE_WEBHOOK_NOTIFICATION_URL` exactly.
- Redirect / success URL must match `CHECKOUT_SUCCESS_REDIRECT_URL`.

Until Square is configured, checkout shows a safe message: payments are not connected yet.

### Optional

| Variable | Purpose |
|----------|---------|
| `TOTP_ENCRYPTION_KEY` | 64 hex chars for admin 2FA secret storage (recommended in production) |
| `SEED_DEMO_USERS` | `true` only on **demo** hosts — not production |

---

## 4. Frontend (Vercel)

| Setting | Value |
|---------|--------|
| Root directory | `frontend` |
| Build | `npm run build` |
| Output | `dist` |

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://your-render-service.onrender.com` (no trailing slash) |

`frontend/vercel.json` handles SPA routing.

---

## 5. Domain and DNS

**Target:** **www.byceleste.com**

1. Point the domain to **Vercel** (frontend).
2. Add the custom domain in Vercel project settings.
3. Update **`FRONTEND_ORIGIN`** on Render to `https://www.byceleste.com`.
4. Update **`CHECKOUT_SUCCESS_REDIRECT_URL`** to the live success page URL.
5. Update Square webhook and redirect URLs to production domains.

---

## 6. Image uploads (important)

Admin can upload product and event images to server disk (`backend/uploads/…`).

**Warning:** On Render free tier, **disk may reset** after redeploy. Uploaded images can disappear.

For long-term production, plan **cloud storage** (e.g. S3, Cloudinary). That integration is not in this repo yet.

---

## 7. Final go-live checklist

- [ ] DNS live for www.byceleste.com
- [ ] HTTPS on frontend and API
- [ ] Square production keys and webhook tested
- [ ] One small real test order → **PAID** in admin
- [ ] Jane logged in at `/admin` with password changed
- [ ] Optional: admin 2FA enabled (Admin → Security)
- [ ] Demo accounts disabled / not seeded on production
- [ ] Policy pages reviewed (final legal wording)
- [ ] Product images finalised

---

## 8. Smoke tests

- [ ] `GET https://<api-host>/health` returns OK
- [ ] Shop loads products
- [ ] Login and account pages work
- [ ] `/admin` requires admin login
- [ ] `/wholesale` requires approved wholesale login
- [ ] CSV export from admin products/orders

---

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — short checklist
- [22-client-handover-guide.md](./22-client-handover-guide.md) — client-facing notes
- [12-square-payment-flow.md](./12-square-payment-flow.md) — Square details
