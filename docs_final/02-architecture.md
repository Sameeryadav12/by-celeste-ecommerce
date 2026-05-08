# Architecture

## Purpose

This document explains (in plain English) how the website is put together: the “front” that people see and the “back” that powers it.

## What will later go into this document

- A simple diagram of how the frontend, backend, and database connect
- Which responsibilities belong to the frontend vs the backend
- How data moves when someone visits pages and places an order
- Where images, product data, events, and accounts will be stored

## Backend authentication (Step 1) — simple picture

Think of three layers working together:

1. **The database (PostgreSQL + Prisma)** — where user records live (name, email, role, etc.). **Prisma** is the tool that lets the backend talk to the database in a structured, type-safe way—like a careful translator between code and tables.
2. **The auth API (Express)** — signup, login, logout, and “who am I?” endpoints. It checks input, creates users, and never sends secret password data back to the client.
3. **A signed session token (JWT) in an HTTP-only cookie** — after login, the browser holds a small **cookie** the website sends on later requests. **JWT** means the token is a cryptographically signed proof of identity (with an expiry), without storing the password in the cookie.

### What is an HTTP-only cookie?

It is a cookie the browser stores but **JavaScript on the page cannot read**. That reduces common attacks where malicious scripts try to steal login state from the browser.

### Why this is safer than “login state in normal browser storage”

Storing tokens or passwords in places ordinary scripts can read (like some kinds of browser storage) is riskier. HTTP-only cookies, **secure** flags in production, and **SameSite** settings are standard ways to keep session delivery tighter—especially as the storefront and API grow.

### Where configuration lives (Prisma ORM v7)

The **database connection URL** for migrations and CLI is configured in `backend/prisma.config.ts`. The **schema** (`prisma/schema.prisma`) describes models and enums; the app connects at runtime using Prisma’s **PostgreSQL driver adapter** (`@prisma/adapter-pg`).

## Frontend authentication (Step 2) — simple picture

On the frontend, the website now talks to the existing authentication routes on the backend.

- The browser sends signup and login forms to the **auth API**.  
- When login succeeds, the backend sets an **HTTP-only cookie**, and the browser sends this cookie automatically on later requests.  
- A small piece of frontend logic checks “who is signed in?” and protects the **Account** page so only signed-in customers can see it.  
- The same cookie settings that keep sessions safe on the backend are respected on the frontend by always sending requests with the right credentials.

## Shared layout and navigation (Step 3) — simple picture

On the frontend, pages now share a **common layout**, so the experience feels joined-up and predictable.

- The header and footer are reused across all main pages, instead of being rebuilt for each screen.  
- Navigation links (Home, Shop, About, Events, Wholesale, Cart, Account/Login) all come from one place, so changes in future are simpler and safer.  
- The header reads the customer’s login state, so it can show either Login/Signup or Account/Logout in a consistent way.  
- This shared structure makes it easier to grow the site later without losing the calm, premium feel.

## Product catalog on the backend (Step 4) — simple picture

The **catalog** is stored in the database as three main building blocks:

1. **Products** — what customers can buy (name, price, descriptions, stock, image, and so on).  
2. **Categories** — groups such as “Body & Bath” or “Face Care” so the shop can be browsed by theme.  
3. **Ingredients** — a library of materials and actives so each product can list what is inside.

**Why link products to categories and ingredients?**

- Categories make the **shop and navigation** easier: the same product can appear in more than one relevant group.  
- Ingredients support **trust and education**: customers can see what a formula contains without guessing.

**Why use “slugs” (short URL names)?**

- A slug is a clean, readable piece of text used in web addresses (for example, `australian-body-silk-lotion` instead of a long database ID).  
- That keeps links **shareable, stable, and good for search**, while the database still uses safe internal IDs behind the scenes.

Public **read** APIs let the website load catalog data later; **admin-only** write routes (for staff) keep changes under control.

## Admin pages and secured actions (Step 11)
The new admin dashboard uses **protected frontend routes** so only a logged-in `ADMIN` user can access the pages.

When Jane makes a change (products, categories, ingredients, events, or orders), the frontend calls **secured backend APIs** that also require `ADMIN` access.

This keeps day-to-day business control separate from the customer-facing store experience.

## Admin portal foundation (Admin Rebuild Step 1)

The admin area has been **rebuilt with its own dedicated layout**, fully separate from the customer-facing storefront.

- The admin portal lives at `/admin` and uses a **sidebar + header + content panel** layout instead of the public storefront's header and footer.
- Only users with the `ADMIN` role can access it — unauthenticated users are redirected to login, and non-admin users are redirected to the homepage.
- The sidebar organises admin tools into groups: **Catalogue** (Products, Categories, Ingredients), **Sales** (Orders, Customers), **Community** (Wholesale, Testimonials, Events), **Content** (Marketing), and **Configuration** (Theme / Appearance, Settings).
- Existing admin pages (Products, Categories, Ingredients, Events, Orders) continue to work inside the new layout.
- New placeholder pages have been created for Customers, Wholesale, Testimonials, Marketing, Theme / Appearance, and Settings — these describe the future controls that will be built in later steps.

See `docs/20-admin-portal-foundation.md` for the full breakdown of sections and technical details.

## SEO foundation (Step 12)

Pages now set their own **page titles** and **meta descriptions** so each URL has unique, useful information.

Where it makes sense, product and event pages also include simple **structured information** (JSON-LD) so search engines can better understand what the page is about.

Clean routes (using stable product and event `slug`s) also improve readability and help discovery.

## Checkout, Square hosted payment, and webhooks (Step 7) — simple picture

When a customer pays, three pieces work together:

1. **The backend creates an order first** — delivery details, line items (with product name/price snapshots), and totals are stored in PostgreSQL **before** the customer is asked for a card.  
2. **The backend asks Square for a hosted payment link** — Square returns a URL; the browser **redirects** the customer to Square’s own checkout page. No Web Payments SDK or card form is embedded on By Celeste in this step.  
3. **Square notifies the backend with webhooks** — after the customer pays (or if payment fails), Square sends signed `payment.updated` events to a dedicated webhook URL. The backend **verifies the signature**, updates the order’s payment status, and avoids double-processing the same event.

The **return URL** after checkout is useful for a friendly “thank you” screen, but the **webhook is the source of truth** for whether money actually cleared—because anyone could bookmark or guess a success link.

