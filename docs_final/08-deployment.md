# Deployment guide

How to put **By Celeste** live for **www.byceleste.com.au**.

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
- [ ] Production admin created with `npm run seed:jane-admin` (`admin.byceleste@gmail.com`).
- [ ] `SEED_DEMO_USERS` is **not** set on production.

---

## 2. Database

### Supabase + Railway

If the API is on **Railway** and the DB is **Supabase**, use pooled URLs only. See **[RAILWAY-SUPABASE-DATABASE.md](./RAILWAY-SUPABASE-DATABASE.md)** (fixes `ENETUNREACH` / invalid Prisma queries).

- **`DATABASE_URL`** — Transaction pooler, port **6543**, `pgbouncer=true`, `sslmode=require`
- **`DIRECT_URL`** — Session pooler on `pooler.supabase.com`, port **5432**, `sslmode=require` (migrations only)

### Render Postgres (or other host)

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
| `FRONTEND_ORIGIN` | Exact Vercel URL, e.g. `https://www.byceleste.com.au` |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_SAMESITE` | `lax` if same site; `none` if API and shop on different domains |
| `CHECKOUT_SUCCESS_REDIRECT_URL` | `https://www.byceleste.com.au/checkout/success` |

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

**Target:** **www.byceleste.com.au**

1. Point the domain to **Vercel** (frontend).
2. Add the custom domain in Vercel project settings.
3. Update **`FRONTEND_ORIGIN`** on Render to `https://www.byceleste.com.au`.
4. Update **`CHECKOUT_SUCCESS_REDIRECT_URL`** to the live success page URL.
5. Update Square webhook and redirect URLs to production domains.

---

## 5b. Discount coupons

Coupons live in Postgres (`DiscountCoupon`, `DiscountCouponUsage`). Migrations create both tables. Jane manages them under **Admin → Discounts**. Discount is applied to the cart **subtotal** before shipping; shipping stays flat **$12**. Coupon usage is recorded only after the Square webhook marks an order **PAID**, so the unique `(couponId, orderId)` index makes webhook retries safe.

To seed the demo coupon (`BIRTHDAY20`, 20%, customers only) on a fresh database:

```bash
cd backend
npm run seed:discount-coupons
```

The seed is idempotent — running it again refreshes settings on the existing row instead of duplicating.

---

## 5c. Transactional emails (Brevo SMTP)

By Celeste uses **Brevo (formerly Sendinblue)** as an SMTP relay for transactional email — password reset, wholesale application alerts, and order alerts. Marketing campaigns are not used.

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | SMTP login from Brevo → Settings → SMTP & API → SMTP |
| `SMTP_PASS` | SMTP key from the same screen |
| `MAIL_FROM_NAME` | Display name on outgoing mail (e.g. `By Celeste`) |
| `MAIL_FROM_EMAIL` | Verified sender address (e.g. `hello@byceleste.com.au`) |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox for wholesale + order alerts and the test command |
| `FRONTEND_PUBLIC_URL` | Public storefront URL used to build email links (e.g. `https://www.byceleste.com.au`) |

Leave `SMTP_USER` / `SMTP_PASS` empty to disable email sending — the password reset flow falls back to logging the link in the backend console and admin alerts simply become no-ops.

### Setup steps

1. Create a Brevo account and verify the sender address.
2. Settings → **SMTP & API** → **SMTP** → generate a key.
3. Copy the SMTP login + key into Render env vars (above).
4. Smoke test locally: `cd backend && npm run test:email` (sends to `ADMIN_NOTIFICATION_EMAIL`).
5. Trigger forgot password from the frontend — Brevo should deliver "Reset your By Celeste password" to the user.

### Domain authentication (production)

Once the basic relay works, set up **SPF/DKIM** for `byceleste.com.au` in Brevo → Senders & IP → Domains. This improves deliverability and is recommended before launch, but is not required for the relay to function.

### Wholesale application alert

When a visitor submits the wholesale form, the API sends `New wholesale application - By Celeste` to `ADMIN_NOTIFICATION_EMAIL` with the applicant's contact details and a direct admin review link. The signup still succeeds even if Brevo is down — alerts are best-effort and never block the user.

### Order alert

When a Square webhook marks an order as `PAID` for the **first time**, the API sends `New order received - BC-XXXX` to `ADMIN_NOTIFICATION_EMAIL` with line items, customer, totals, and an admin order link. The unique `processed_square_webhook_event` row plus a prior-status check ensure retried webhooks do not duplicate the alert.

---

## 6. Image uploads (important)

Admin can upload product and event images to server disk (`backend/uploads/…`).

**Warning:** On Render free tier, **disk may reset** after redeploy. Uploaded images can disappear.

For long-term production, plan **cloud storage** (e.g. S3, Cloudinary). That integration is not in this repo yet.

---

## 7. Final go-live checklist

- [ ] DNS live for www.byceleste.com.au
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
