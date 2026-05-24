# By Celeste — E-commerce Platform

[![CI](https://github.com/Sameeryadav12/by-celeste-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/Sameeryadav12/by-celeste-ecommerce/actions/workflows/ci.yml)

**Repository:** [github.com/Sameeryadav12/by-celeste-ecommerce](https://github.com/Sameeryadav12/by-celeste-ecommerce)

Online shop and business tools for **By Celeste**, an Australian skincare brand. Customers can browse and buy products. Staff use an **admin portal** to manage the shop. Approved **wholesale** buyers get half-price ordering.

---

## Who this is for

| Reader | Start here |
|--------|------------|
| **Jane / client** | [docs_final/22-client-handover-guide.md](./docs_final/22-client-handover-guide.md) |
| **Developer setting up locally** | [docs_final/01-setup-guide.md](./docs_final/01-setup-guide.md) |
| **Deploying to production** | [docs_final/08-deployment.md](./docs_final/08-deployment.md) |

---

## What the system does

### Customer website

Public site at the shop domain (target: **www.byceleste.com**):

- Home, shop, product pages, cart, checkout  
- Events and testimonials  
- Policy pages (shipping, returns, privacy, terms)  
- Customer accounts (orders, profile, password)  

### Admin portal

Private area at **`/admin`** (admin login required):

- Dashboard (Square status, low stock, policy reminders)  
- Products, categories, ingredients  
- Orders and customers  
- Wholesale approvals  
- Events and testimonials  
- Marketing, theme, business settings  
- Security (optional 2FA)  
- CSV exports  

### Wholesale portal

Private area at **`/wholesale`** (approved wholesale accounts only):

- 50% off retail pricing  
- Shop, bulk orders, cart, checkout  
- Order history and support information  

### Backend and database

- **Node.js API** (Express) stores all business data  
- **PostgreSQL** database via Prisma  
- **Square** for card payments when configured  

---

## Tools used

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL, Prisma |
| Payments | Square (hosted checkout + webhooks) |

---

## Key features

- Full product catalog with categories and ingredients  
- Shopping cart and flat-rate shipping ($12 per order)  
- Square checkout when connected; safe message when not  
- Customer accounts, order history, loyalty points  
- Wholesale application and approval flow  
- Events with optional images  
- Admin image upload for products and events  
- Order numbers BC-1000, BC-1001, …  
- SEO on main pages  

---

## Project architecture (simple view)

```
Browser  →  Vercel (React website)
              ↓ API calls
           Render (Express API)
              ↓
           PostgreSQL
              ↓
           Square (payments)
```

Local development: Vite on port **5174** proxies `/api` to the API on port **4000**.

---

## Repository layout

```
├── frontend/       React storefront + admin + wholesale UI
├── backend/        Express API, Prisma, seeds, uploads
├── docs_final/     Handover and technical documentation
├── docs/           Additional project notes
├── .github/        CI workflows
└── README.md       This file
```

Design wireframes and Canva exports are **not** in Git (see `.gitignore`); keep them locally if needed.

---

## Quick start (developers)

```bash
git clone https://github.com/Sameeryadav12/by-celeste-ecommerce.git
cd by-celeste-ecommerce
```

Follow **[docs_final/01-setup-guide.md](./docs_final/01-setup-guide.md)** for full steps.

**Short version:**

```bash
# Backend
cd backend
cp .env.example .env          # edit DATABASE_URL, JWT_ACCESS_SECRET
npm install
npx prisma migrate dev
npx prisma generate
npm run seed:catalog
npm run seed:events
npm run dev                   # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5174
```

---

## Environment variables

### Backend (`backend/.env` from `.env.example`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `JWT_ACCESS_SECRET` | Yes | Auth tokens |
| `FRONTEND_ORIGIN` | Production | CORS and cookies (e.g. `http://localhost:5174` locally) |
| `AUTH_COOKIE_SECURE` | Production | `true` on HTTPS |
| `AUTH_COOKIE_SAMESITE` | Production | `lax` or `none` for cross-site cookies |
| `SQUARE_ACCESS_TOKEN` | For payments | Square API |
| `SQUARE_LOCATION_ID` | For payments | Square location |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | For payments | Webhook verification |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | For payments | Public webhook URL |
| `CHECKOUT_SUCCESS_REDIRECT_URL` | For payments | After checkout success |
| `TOTP_ENCRYPTION_KEY` | Optional | Admin 2FA (64 hex chars) |
| `JANE_ADMIN_PASSWORD` | Seed only | One-time Jane admin setup |

Never commit `.env`. Use placeholders in `.env.example` only.

### Frontend (`frontend/.env.local` optional)

| Variable | When |
|----------|------|
| `VITE_API_BASE_URL` | Production build only — Render API URL, no trailing slash |

Leave unset for local dev (Vite proxy).

---

## Database

```bash
cd backend
npx prisma migrate dev      # local development
npx prisma migrate deploy     # production
npx prisma generate
```

Migrations live in `backend/prisma/migrations/`.

---

## Seed commands

| Command | Purpose |
|---------|---------|
| `npm run seed:catalog` | Products and catalog |
| `npm run seed:events` | Sample events |
| `npm run seed:demo-admin` | Demo users (local only) |
| `npm run seed:jane-admin` | Jane production admin |

Details: [docs_final/02-demo-accounts-and-seeding.md](./docs_final/02-demo-accounts-and-seeding.md)

---

## Run and build

| Task | Command |
|------|---------|
| Dev API | `cd backend && npm run dev` |
| Dev UI | `cd frontend && npm run dev` |
| Build API | `cd backend && npm run build` |
| Build UI | `cd frontend && npm run build` |
| Run API (compiled) | `cd backend && npm start` |

---

## Deployment

| Component | Suggested host |
|-----------|----------------|
| Frontend | Vercel (`frontend/`) |
| Backend | Render (`backend/`) |
| Database | Render PostgreSQL |

Full guide: **[docs_final/08-deployment.md](./docs_final/08-deployment.md)**

Production domain target: **www.byceleste.com**

---

## Handover notes

- **Production admin email:** jane.byceleste@gmail.com  
- **Business:** By Celeste, ABN 42 491 484 966, Leneva VIC  
- **Support:** jane.byceleste@gmail.com  
- Client guide: [docs_final/22-client-handover-guide.md](./docs_final/22-client-handover-guide.md)  

---

## Pending before go-live (client)

1. Square production keys and webhook setup  
2. DNS for **www.byceleste.com**  
3. Final product images (if not all uploaded)  
4. Final policy / legal wording  
5. Launch sign-off  

---

## Security

- Do not commit `.env`, tokens, or real passwords  
- `frontend/public/images/reference/` is gitignored (competitor reference only)  
- Uploaded images on Render disk may not persist — plan cloud storage for production  

---

## Documentation index

See **[docs_final/README.md](./docs_final/README.md)** for all technical docs.

---

## License

[MIT](./LICENSE)
