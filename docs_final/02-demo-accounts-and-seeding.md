# Demo accounts and seeding

How to load sample data and test accounts. **Use demo seeds on local machines only**, not on the live production site.

---

## Production admin portal

| Purpose | Email |
|---------|--------|
| Admin portal login | admin.byceleste@gmail.com |
| Customer / wholesale support | jane.byceleste@gmail.com |

| Item | Value |
|------|--------|
| Email | admin.byceleste@gmail.com |
| Role | ADMIN |

**Password:** Set in `backend/.env` as `ADMIN_PASSWORD` (or `JANE_ADMIN_PASSWORD`) before running the seed. Change it after first login.

```bash
cd backend
# Add ADMIN_PASSWORD="your-secure-password" to .env
npm run seed:jane-admin
```

Do **not** commit `.env` or share passwords in GitHub.

---

## Seed commands

| Command | What it does |
|---------|----------------|
| `npm run seed:catalog` | Products, categories, ingredients (By Celeste range) |
| `npm run seed:events` | Sample events |
| `npm run seed:demo-admin` | Demo admin + demo customer + approved wholesale user |
| `npm run seed:demo-customer` | Retail customer only |
| `npm run seed:local` | Catalog, events, demo users, one paid demo order |
| `npm run seed:demo-paid-order` | One PAID / CONFIRMED order for admin UI testing |
| `npm run seed:jane-admin` | Production admin account (production handover) |

Run from the **`backend/`** folder after `npx prisma migrate dev`.

---

## Demo accounts (local only)

Created by `npm run seed:demo-admin` (override with env vars in `.env.example`):

| Email | Role | Use |
|-------|------|-----|
| admin.byceleste@gmail.com | ADMIN | Production / demo admin (use a strong password in production) |
| customer@byceleste.com | CUSTOMER | Test retail account |
| wholesale@byceleste.com | WHOLESALE (approved) | Test wholesale portal |

Passwords are defined in `backend/.env.example` as **commented examples only**. Set your own in `.env` if you change them.

---

## Wholesale demo user

`npm run seed:demo-admin` also creates an **approved** wholesale account (`wholesale@byceleste.com` by default).

To approve real applicants: **Admin → Wholesale** → open application → Approve.

---

## Reset catalog (careful)

```bash
npm run catalog:reset
npm run seed:catalog
```

This removes catalog data — use only on a dev database.

---

## Related docs

- [01-setup-guide.md](./01-setup-guide.md)
- [22-client-handover-guide.md](./22-client-handover-guide.md)
