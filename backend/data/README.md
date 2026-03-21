# Client catalog data (optional override)

## What this folder is for

When Jane provides a **Word document** with the real product range, the development team can turn it into a **Markdown file** that matches the same structure as `docs/04-products.md`, then save it here as:

- **`client-products.md`**

## How seeding chooses the file

`npm run seed:catalog` (script: `backend/src/scripts/seedCatalog.ts`) will:

1. Use **`backend/data/client-products.md`** if that file exists.
2. Otherwise use **`docs/04-products.md`** (the project default).

The parser expects the same headings and markers as the main products doc (for example `### By Celeste – Product Name`, `**Description:**`, `**Key benefits:**`, `**Key ingredients:**`, `**How to use:**`, `**Price:** AUD $…`).

## Workflow from Word

1. In Word, keep one product per section with clear headings.
2. Export or paste into Markdown (Cursor, Pandoc, or manual copy).
3. Adjust headings to match `docs/04-products.md` (see examples there).
4. Ensure **slugs** stay stable: product names map to URL slugs via the same rules as before (see seed script `REQUIRED_PRODUCT_SLUGS` if you are not adding/removing products).
5. Put product images in `frontend/public/images/products/` using the same filename pattern as existing slugs (e.g. `kakadu-plum-radiance-facial-oil.jpg`), and update `IMAGE_URL_BY_SLUG` in `seedCatalog.ts` if you add new products.

## Adding or removing products

That requires updating:

- `REQUIRED_PRODUCT_SLUGS`, `IMAGE_URL_BY_SLUG`, and `CATEGORY_BY_SLUG` in `seedCatalog.ts`
- The markdown source (either `client-products.md` or `docs/04-products.md`)

Ask a developer before changing the product count so the database seed and admin flows stay aligned.
