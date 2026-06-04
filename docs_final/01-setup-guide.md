# Local setup guide

Step-by-step instructions to run **By Celeste** on your computer.

**You need:** Node.js 20+, PostgreSQL, and this repository cloned.

---

## 1. Install Node.js

1. Download **Node.js 20 LTS** or newer from [nodejs.org](https://nodejs.org).
2. Install with default options.
3. Open a terminal and check:

```bash
node -v
npm -v
```

---

## 2. Install PostgreSQL

**Option A — local install**

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
2. Create a database named `by_celeste` (or any name you prefer).

**Option B — Docker (from `backend/` folder)**

```bash
cd backend
docker compose up -d
```

Use the Docker URL from `backend/.env.example` (port **5433**).

---

## 3. Clone the repository

```bash
git clone https://github.com/Sameeryadav12/by-celeste-ecommerce.git
cd by-celeste-ecommerce
```

---

## 4. Install backend packages

```bash
cd backend
npm install
```

---

## 5. Install frontend packages

```bash
cd ../frontend
npm install
```

---

## 6. Create backend `.env`

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:

- Set `DATABASE_URL` to your Postgres connection string.
- Set `JWT_ACCESS_SECRET` to a long random string.
- Leave Square keys empty for local work (checkout will show “not connected” — that is normal).

---

## 7. Create frontend env (optional)

```bash
cd ../frontend
cp .env.example .env.local
```

For local dev you can leave `VITE_API_BASE_URL` **unset**. Vite proxies `/api` to `http://localhost:4000`.

---

## 8. Run database migrations

```bash
cd ../backend
npx prisma migrate dev
```

---

## 9. Generate Prisma client

```bash
npx prisma generate
```

---

## 10. Seed data (recommended)

**Catalog and events:**

```bash
npm run seed:catalog
npm run seed:events
```

**Demo accounts (local testing only):**

```bash
npm run seed:demo-admin
```

**Production admin (set `ADMIN_PASSWORD` in `.env` first):**

```bash
npm run seed:jane-admin
```

See [02-demo-accounts-and-seeding.md](./02-demo-accounts-and-seeding.md).

---

## 11. Start the backend

```bash
cd backend
npm run dev
```

API runs at **http://localhost:4000**.

---

## 12. Start the frontend

Open a **second** terminal:

```bash
cd frontend
npm run dev
```

Storefront runs at **http://localhost:5174**.

---

## Quick checks

| URL | What to expect |
|-----|----------------|
| http://localhost:5174 | Home page |
| http://localhost:5174/admin | Redirects to login if not signed in |
| http://localhost:5174/shop | Product list |

---

## Build commands (optional)

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

---

## More help

- [22-client-handover-guide.md](./22-client-handover-guide.md) — for Jane (non-technical)
- [08-deployment.md](./08-deployment.md) — going live on Vercel + Render
- [README.md](../README.md) — project overview
