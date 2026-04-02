# UI and brand polish (Perplexity-aligned pass)

## Purpose

This note is for **Jane** in plain English. It summarises a focused polish pass that aligned the storefront with feedback in **`Perplexity.txt`** (analysis of screenshots and client requirements). We did **not** change deployment or start a new architecture phase.

## What the analysis said was already strong

- Homepage branding, tagline, and Australian / cruelty-free messaging.
- Events area (list, detail, Victoria-style locations).
- Shop and auth flows feeling **simple and modern**.
- Wholesale page feeling professional.
- Overall calmer, more premium feel than cluttered competitor sites.

## What we improved in code

### 1. Freight calculator (top priority)

- **Cart page:** 4-digit postcode, **Calculate shipping**, validation errors, clear success copy (e.g. shipping to a postcode or free shipping over **$120**).
- **Totals:** **$9.95** under **$120**, **free** at **$120+** (demo, same idea as checkout).
- Order summary shows **—** for shipping/total until resolved; **Continue to checkout** disabled until then.

### 2. Australian / native identity (subtle)

- **Footer:** Refined trust area—cruelty-free + Australian made, with a **minimal kangaroo** and light **native botanical** cue (not large or cartoonish).
- **Homepage:** Stronger but still calm copy on **Australian ingredients**, **regional Victoria**, and events as a differentiator.
- **Shop / product:** Small **ingredient badges** on cards (max 2) and detail (max 3) where catalog data matches native heroes.

### 3. About page

- More **personal founder / Victoria / small-batch** story, without exaggerated claims.
- **Location** on the site: **Leneva Victoria, Australia** (centralised in `frontend/src/config/businessAddress.ts`; shown in the footer **Contact** block and on **About**). No street address or postcode is displayed, per client request for a clean, premium look.

### 4. Events (light touch)

- Event detail: **Add to calendar (.ics)** download and **Open in Google Maps** link (no new npm dependencies).
- Slightly stronger CTAs on event cards.

### 5. Wholesale and auth (light touch)

- Wholesale: clearer **approval**, **trade pricing after approval**, and short **benefits** list.
- Login / signup: short note that **loyalty points** apply after **completed paid** orders when signed in.
- Login: brief **session check** message while auth is loading.

### 6. Competitor-aware positioning (tone, not a redesign)

The site doubles down on what makes By Celeste believable: **local**, **native botanicals**, **events**, **boutique regional** feel, and a **clean** UI—without stuffing the homepage.

## Files to know (frontend)

- Cart / freight: `frontend/src/pages/CartPage.tsx`, `frontend/src/features/cart/cartFreight.ts`, `frontend/src/features/cart/components/CartSummaryCard.tsx`
- Native badges: `frontend/src/features/catalog/nativeIngredientHighlights.ts`, `ProductCard.tsx`, `ProductDetailPage.tsx`
- Layout / footer: `frontend/src/layouts/MainLayout.tsx`
- Home / About / Shop: `HomePage.tsx`, `AboutPage.tsx`, `ShopPage.tsx`
- Events: `EventDetailPage.tsx`, `EventCard.tsx`, `frontend/src/features/events/eventCalendar.ts`
- Wholesale / auth: `WholesalePage.tsx`, `LoginPage.tsx`, `SignupPage.tsx`

## Installs and config

**None** were added for this polish pass (calendar file is built as a string; maps opens in Google Maps in a new tab).

## Related docs

- High-level: `docs/01-overview.md`
- Products and badges: `docs/04-products.md`
- Cart and freight: `docs/05-orders-and-checkout.md`
