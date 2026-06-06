# By Celeste E-Commerce Platform

A full-stack e-commerce website with customer shopping, admin management, wholesale ordering, Square payment readiness, and SEO support.

**Live demo:** [www.byceleste.com.au](https://www.byceleste.com.au/)

**Portfolio repository:** [github.com/Sameeryadav12/by-celeste-ecommerce](https://github.com/Sameeryadav12/by-celeste-ecommerce)

> **Important:** This repository is a portfolio-safe version. Private credentials, production environment variables, and client handover secrets are excluded. Use `.env.example` placeholders for local setup.

---

## 1. Project Overview

By Celeste is a production-style e-commerce platform for an Australian skincare brand. It includes a public storefront, secure admin portal, wholesale buyer area, product catalog, cart and checkout flow, events, testimonials, and operational tooling for day-to-day business use.

The live site is deployed and publicly accessible at [www.byceleste.com.au](https://www.byceleste.com.au/).

---

## 2. My Role

**Sameer Yadav** — Lead Developer and Frontend Developer

I worked as part of a team to deliver and refine the platform. My contributions included:

- Frontend pages and UI improvements
- Customer website features and product detail experience
- Cart and checkout UX improvements
- Admin portal polishing
- Wholesale portal finalisation, including the **$300 wholesale minimum order rule**
- Discount coupon system support
- Password reset flow
- Brevo email integration support
- Square setup support
- SEO optimisation (metadata, sitemap, robots.txt, structured data)
- Production deployment support
- Bug fixing, testing, and client handover documentation

---

## 3. Key Features

- Product catalog with categories, ingredients, search, and filters
- Shopping cart, coupons, and flat-rate shipping
- Square hosted checkout (when configured)
- Customer accounts, order history, and loyalty points
- Wholesale application, approval workflow, and bulk ordering
- Admin dashboard for products, orders, customers, events, and content
- Transactional email readiness (Brevo SMTP)
- SEO support on public pages

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL, Prisma |
| Payments | Square (hosted checkout + webhooks) |
| Email | Brevo SMTP (transactional) |
| Deployment | Vercel (frontend), Railway (API), Supabase (PostgreSQL) |

---

## 5. Architecture

```
Browser  →  Vercel (React SPA)
              ↓ REST API
           Railway (Express API)
              ↓
           Supabase PostgreSQL
              ↓
           Square (payments)
```

Local development uses Vite on port **5174** with a proxy to the API on port **4000**.

---

## 6. Customer Website

Public routes include home, shop, product detail, cart, checkout, events, testimonials, about, and policy pages. Product pages support structured data for search engines.

---

## 7. Admin Portal

Protected area at `/admin` for staff operations:

- Products, categories, ingredients
- Orders and customers
- Wholesale approvals
- Events, testimonials, marketing, theme, and business settings
- Optional admin 2FA
- CSV exports

---

## 8. Wholesale Portal

Protected area at `/wholesale` for approved trade buyers:

- Wholesale pricing (50% off retail where configured)
- Bulk order tools
- Order history
- **$300 minimum product subtotal** before shipping for approved wholesale checkout

---

## 9. Security and Access Control

- Role-based access (customer, wholesale, admin)
- JWT auth with HTTP-only cookies
- Server-side validation for checkout and wholesale rules
- Admin routes protected by role checks
- Secrets stored in environment variables only (never committed)

---

## 10. Payment and Email Integration

- **Square:** hosted checkout and webhook handling when tokens are configured
- **Brevo:** SMTP for password reset, order alerts, and wholesale application notifications

Both integrations use environment variables. See `.env.example` for placeholders.

---

## 11. SEO and Deployment

- Page titles, meta descriptions, canonical URLs, and Open Graph tags
- JSON-LD on home and product pages
- `robots.txt` and build-time `sitemap.xml`
- Frontend on Vercel; API on Railway; database on Supabase

---

## 12. What I Learned

- Building a multi-role e-commerce app with separate customer, admin, and wholesale flows
- Enforcing business rules on both frontend and backend (e.g. wholesale minimum order)
- Integrating third-party payment and email services safely
- Deploying a split frontend/API stack with CORS and cookie configuration
- Writing portfolio-safe documentation and excluding secrets from version control

---

## 13. Local Setup

```bash
git clone https://github.com/Sameeryadav12/by-celeste-ecommerce.git
cd by-celeste-ecommerce

# Backend
cd backend
cp .env.example .env    # edit with local placeholders
npm install
npx prisma migrate dev
npx prisma generate
npm run dev             # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # http://localhost:5174
```

See [docs_final/01-setup-guide.md](./docs_final/01-setup-guide.md) for full setup notes.

---

## 14. Environment Variables

Copy `backend/.env.example` and `frontend/.env.example`. Use placeholders only.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `DIRECT_URL` | Prisma migrations (pooler/direct URL) |
| `JWT_ACCESS_SECRET` | Auth tokens |
| `FRONTEND_ORIGIN` | CORS and cookies |
| `SQUARE_*` | Payment integration |
| `SMTP_*` | Brevo email |
| `VITE_API_BASE_URL` | Frontend → API URL (production build) |

Never commit `.env` files.

---

## 15. Screenshots

<!-- Add screenshots here -->
| Page | Screenshot |
|------|------------|
| Home | _Add screenshot_ |
| Shop | _Add screenshot_ |
| Product detail | _Add screenshot_ |
| Admin dashboard | _Add screenshot_ |
| Wholesale portal | _Add screenshot_ |

---

## 16. Future Improvements

- Admin-editable SEO fields
- Cloud storage for uploaded product/event images
- Automated E2E test suite
- Enhanced analytics and reporting
- Wholesale self-service invoice exports

---

## Documentation

Technical and handover docs are in [docs_final/](./docs_final/). Treat production credentials as private even if example emails appear in handover notes.

---

## License

MIT — see [LICENSE](./LICENSE).
