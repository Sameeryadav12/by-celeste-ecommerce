# Client assets and real catalog data

## Purpose

This note explains how **Jane’s real files** (logo, Word product document, competitor references) plug into the By Celeste project **without** redesigning the whole site.

## 1. Logo

- **Where to put files:** `frontend/public/images/branding/`
- **Expected names:** `logo.svg` (best), then `logo.png`, optional `logo.webp`
- **Where it appears:** Main header (home link) and footer brand column
- **Implementation:** `frontend/src/components/branding/BrandLogo.tsx` — tries each file, then falls back to the text “By Celeste” if nothing loads

See `frontend/public/images/branding/README.md` for filename and sizing tips.

## 2. Product data from Word

The database catalog is seeded by `npm run seed:catalog` using Markdown that matches the structure of `docs/04-products.md`.

**Optional client override:**

- If `backend/data/client-products.md` exists, the seed script uses **that** file instead of `docs/04-products.md`.
- Same section format (headings, `**Description:**`, benefits bullets, ingredients, how-to-use, price line).

See `backend/data/README.md` for the Word → Markdown workflow and what to update if products are added or removed.

**Images:** Product photos live under `frontend/public/images/products/`; paths are mapped in `IMAGE_URL_BY_SLUG` inside `backend/src/scripts/seedCatalog.ts`.

## 3. Competitor screenshots

- **Where to put files:** `frontend/public/images/reference/`
- **Use:** Internal UX reference only (spacing, clarity, tone). We do **not** copy competitor layouts or branding.

## 4. Light UX adjustments (competitor-informed)

Small, generic improvements (more breathing room on the home page and shop cards, clearer product typography) are applied in code comments where relevant — always **original** layout and By Celeste styling.

## 5. Documentation touchpoints

- **Overview:** `docs/01-overview.md` — client assets + catalog source summary
- **Products doc:** `docs/04-products.md` — canonical marketing copy when not using `client-products.md`
