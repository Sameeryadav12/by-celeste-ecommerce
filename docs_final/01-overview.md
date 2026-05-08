# Overview (By Celeste)

## Purpose

This document gives Jane Watson a simple, high-level understanding of what the By Celeste website will do.

## What will later go into this document

- What customers can do on the website (browse, buy, manage their account)
- What staff can do (manage products, orders, events, and wholesale)
- What “success” looks like for launch (key goals and measurable outcomes)
- A short glossary of key terms used across the project

## Secure user foundation (Step 1)

By Celeste now has the **first secure user foundation** on the backend. That means the system can recognise who someone is when they sign up and log in—without building the shop screens yet.

### Types of users we support

- **Customer** — the standard shopper who buys from the store.
- **Wholesale** — a business buyer (pricing and rules will be added later; signup is controlled, not public).
- **Admin** — trusted staff who can manage the business side of the site (created separately from public signup).

### Why this matters for the business

This foundation protects Jane’s brand and customers: accounts are separate from “just browsing,” passwords are handled safely, and the team can grow features (orders, loyalty, wholesale) knowing **who** each action belongs to. It is the base layer for trust, personalisation, and control as the store grows.

## Secure customer login on the website (Step 2)

By Celeste now has the **first customer-facing secure feature** on the storefront. Customers can create an account, sign in, and see a simple account area that confirms who they are.

- Customers can **sign up** with their name, email, and a strong password.  
- Returning customers can **sign in** from the website.  
- The site can now **recognise signed-in customers securely**, using the same safe cookie approach from Step 1.  
- A secure **Account** area shows who is signed in (expanded in **Step 8** with orders and loyalty).

## Main website shell and navigation (Step 3)

By Celeste now has its **main visual structure** for the storefront. The site feels more like a real store, even though product data and orders are still to come.

- Every key area (Home, Shop, About, Events, Wholesale, Cart, Checkout, Account) now has a clear page.  
- A shared header and footer make it easy for customers to move around.  
- The look and feel are calm, light, and consistent with a premium skincare brand, ready for future content.

## Product catalog foundation (Step 4)

By Celeste now has a **real product catalog foundation** on the backend. Products, categories, and ingredients can be stored in the database in a structured way.

- Each **product** can have a name, descriptions, price, stock, image path, and flags such as “featured.”  
- **Categories** help group products (for example, body care vs face care).  
- **Ingredients** describe what goes into formulas for transparency on product pages.  
- This layer is the **base for the real shop experience** when the storefront is connected to live data in a later step.

## Real shop browsing and product pages (Step 5)

By Celeste can now display **real products** from the backend catalog on the website.

- Customers can open the **Shop** page and browse live product cards.  
- They can **filter by category** and **search by product name**.  
- Each card links to a real **Product Detail** page with descriptions, ingredients, and how-to-use guidance.  
- The store is now moving from prototype screens to **real, connected product content**.

## Cart and pre-payment checkout flow (Step 6)

By Celeste now supports a real pre-payment purchase flow on the website.

- Customers can add products to a **cart**, adjust quantities, and remove items.  
- The site now shows **subtotal, shipping estimate, and final total** before payment.  
- Customers can enter delivery details in checkout and review their order before secure payment is connected.  
- This moves the store much closer to a complete buying journey.

## Secure hosted checkout with Square (Step 7)

Checkout is now **real and safer for customers**: the website saves an **order record in the database before any money moves**, then sends the shopper to **Square’s hosted checkout page**.

- **Card details are handled entirely by Square** — By Celeste does not collect or store raw card numbers on its own pages.  
- **Totals are confirmed on the server** using live product prices and the same shipping rules as the cart preview, so the browser cannot “invent” a cheaper total.  
- After payment, Square can send the shopper back to a **success** page on the website, while **Square webhooks** (secure server-to-server messages) are the reliable signal that payment really completed.  
- This step focuses on the payment handoff and order records; customer dashboards and admin order screens can build on the same foundation later.

## Customer account, orders, and loyalty (Step 8)

Signed-in customers now have a **useful account dashboard**, not just a profile placeholder.

- They can see **past orders** placed while logged in and open **order details** (items, delivery address, totals, statuses).  
- **Loyalty points** are tracked in the database: points are earned when **Square confirms payment** (via webhook), not while browsing or before payment succeeds.  
- Points and history are visible in the account area, which helps **trust** and **repeat purchases** without overwhelming Jane’s customers with complexity.

Wholesale-specific pricing and login flows remain a later step; the loyalty foundation here applies to normal customer accounts first.

## Wholesale path and business pricing (Step 9)

By Celeste now supports a **separate wholesale journey** for stockists and partners, without changing how everyday customers shop.

- Businesses can **apply for a wholesale account** (pending review). **Approved** wholesale users automatically see **lower unit prices** in the shop and at checkout where a wholesale price exists.  
- **Retail customers and guests** always see **standard retail pricing** only.  
- This helps Jane **segment retail and trade** clearly: the same catalog and checkout flow, with pricing that adapts safely on the server when the account is eligible.

## Real events area (Step 10)

By Celeste now supports a **real events area**.

- Customers can open the **Events** page and see **upcoming pop-ups and community events** with the key details (title, date/time, and location).
- This helps promote in-person engagement and builds brand visibility beyond the online shop.

## Admin dashboard (Step 11)

By Celeste now has a **secure admin dashboard** for trusted staff.

Jane (and other admins) can manage everyday business content without needing developer help:

- **Products** (create/edit, toggle active/featured, set wholesale pricing where applicable)
- **Categories and ingredients** (keep the catalog tidy and up to date)
- **Events** (create/edit events and publish/unpublish them)
- **Orders** (view recent orders, customer details, and payment/status info)

This reduces the back-and-forth for routine changes and keeps business control separated from the customer shopping experience.

## SEO foundation (Step 12)

By Celeste now includes a basic **search-engine-friendly page structure**.

- **Products** and **events** now have clearer page titles and descriptions for discovery.
- Key pages set their own page information (so every URL has unique, helpful context).

This helps By Celeste appear more professionally online and improves the chance that new visitors can find the site through search.

## Final branding, Australian identity, and UX polish (Step 15)

By Celeste now presents as a **premium Australian skincare brand** with clear identity and trust signals. A later **requirements-alignment polish pass** (documented in `docs/18-ui-and-brand-polish.md`) tightened the same themes without changing core architecture.

### Brand and identity

- **Tagline:** “Traditional, Natural, Exceptional Skincare” is prominently displayed in the homepage hero with elegant typography and premium spacing.
- **Homepage flow:** **Hero** → **featured products** (from the live catalog) → **Australian native ingredients** (three curated highlights) → **events**, then footer. Extra mid-page blocks were reduced so the story stays scannable.
- **Native ingredients:** Product cards and detail pages still use **subtle native badges** where formulas match; the PDP adds a **“Featuring Australian natives”** block when highlights apply (see `docs/04-products.md`).
- **Trust row (site-wide):** A single row of **three** trust badges (**Australian Made**, **Native Ingredients**, **Cruelty-Free**) with minimal outline icons sits **above the footer** on every page—clean competitor-style trust without clutter.

### Improved shipping clarity (cart)

- **Rules (client update):** Flat-rate shipping is now **$12 per order** via **Australia Post**.
- **No discount tiers:** There is no free-shipping threshold and no quantity-based shipping discount logic.
- **Totals:** Shipping and grand total are shown consistently in cart and checkout using the same shared rules as backend checkout.

## Testimonials Feature

By Celeste now includes a dedicated **Testimonials** page to build trust through real customer feedback.

- Customers can open **`/testimonials`** from the main navigation.
- Testimonials are shown in a calm premium card grid for easy reading.
- The **Home** page includes a short preview section with a button to view all testimonials.
- This helps new visitors feel confident before buying by seeing authentic customer experiences.

### Visibility and polish

- **Events:** Homepage still surfaces upcoming events; **event detail** pages add **Add to calendar (.ics)** and **Open in Google Maps** (no extra npm packages).
- **About:** Stronger **founder and regional Victoria** narrative while staying honest and warm.
- **Wholesale / auth:** Wholesale copy clarifies **approval**, **trade pricing after approval**, and benefits; sign-in and sign-up mention **loyalty points** after paid orders.
- **Footer links:** Quick links navigate to Shop, Events, Wholesale, and About.
- **UI consistency:** Spacing, typography hierarchy, and CTA styles stay calm and curated.

The site aims to feel **premium, clean, Australian, believable, and marketable**—distinct from generic mass-market skincare sites.

## Client assets and real catalog content (ongoing)

Jane can supply **logo files**, a **Word document** with final product copy, and **reference screenshots** (competitors or inspiration). The codebase is wired so those integrate cleanly:

- **Logo:** Add `logo.svg` and/or `logo.png` under `frontend/public/images/branding/`. The header and footer use `BrandLogo`, which falls back to the text wordmark if files are missing.
- **Product data:** `npm run seed:catalog` reads **`backend/data/client-products.md`** when that file exists (same Markdown structure as `docs/04-products.md`); otherwise it keeps using `docs/04-products.md`. Product images stay under `frontend/public/images/products/` with paths mapped in the seed script.
- **Reference images:** Competitor or mood images can live under `frontend/public/images/reference/` for internal use only.

Details: **`docs/19-client-assets-and-catalog.md`**, plus folder READMEs in `frontend/public/images/branding/` and `backend/data/`.

## Premium UI polish (competitor-informed, final pass)

This pass improves **visual quality and brand clarity** only—**no** full redesign, **no** heavy animation, maps, social APIs, or quizzes.

### What changed

- **Trust badges:** One balanced row of three values (above footer), equal icon size and spacing—addresses common competitor mistakes (too many badges or uneven icons).
- **Product detail page:** Long copy is split into **Overview** (short), **Key benefits** (bullets), **Featuring Australian natives** (tags when relevant), **Ingredients** (name + short explanation, soft secondary text), and **How to use** (numbered steps when the data has multiple lines). Easier to scan than a wall of paragraphs.
- **Homepage:** Clear **section hierarchy** and **softer body grey** for supporting text; **more air** between blocks; **featured products** load from the API; redundant promo cards were removed in favour of a minimal “More” link row (About · Wholesale).
- **Typography:** Larger hero and section headings where it matters; consistent **neutral-500** tone for secondary copy.

### Explicitly not implemented (by design)

- GSAP / complex motion, interactive maps, quizzes, Instagram feeds, and similar—kept for stability and scope.

## GitHub and deployment readiness

The repo is structured for **GitHub** with a root **`.gitignore`** (no `node_modules`, builds, `.env` files, or **`frontend/public/images/reference/`** competitor assets). Deployment targets documented in the root **`README.md`** (Vercel + Render + Postgres) and the checklist **`docs/DEPLOYMENT.md`**. The frontend uses **`VITE_API_BASE_URL`** in production; the backend requires **`FRONTEND_ORIGIN`** for CORS when the API and storefront are on different hosts.
