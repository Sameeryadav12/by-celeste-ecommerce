# Admin Portal Foundation

## Purpose

This document explains how the admin portal is set up, who can access it, and what sections are prepared for future business controls.

## How the admin area is separated from the public website

The admin portal lives at `/admin` inside the same frontend application, but it uses a **completely separate layout** from the customer-facing storefront.

- The public website uses `MainLayout` — the header, footer, trust badges, and storefront navigation that customers see.
- The admin portal uses `AdminLayout` — a dedicated sidebar + header + content layout that looks and feels like a professional control panel.

When someone visits `/admin`, they do **not** see the public header, footer, or any storefront UI. The admin area is designed to feel like a separate tool, even though it shares the same codebase and deployment.

## Who can access the admin area

Only users with the `ADMIN` role can reach any `/admin` route.

The access control works in two layers:

1. **`AdminProtectedRoute`** — a route guard component that wraps all admin routes. It checks the user's authentication status and role before rendering anything.
2. **Redirect behaviour**:
   - If not logged in → redirected to `/login` (with a return path saved so they come back after logging in).
   - If logged in but not an admin → redirected to `/` (the homepage).
   - If logged in as admin → allowed through.

This guard is **reusable** — any future admin routes only need to be nested inside the `AdminProtectedRoute` wrapper in the router.

## Admin layout structure

The admin layout has three main areas:

1. **Sidebar** (left side, 256px wide on desktop) — contains the brand name, navigation groups, and signed-in user info at the bottom.
2. **Top header** (full width across the content area) — shows a "View store" link, the admin's name, and a sign-out button.
3. **Main content panel** — scrollable area where each admin page renders.

On mobile and tablet (below `lg` breakpoint), the sidebar is hidden by default and opens as an overlay when the hamburger button is tapped.

## Sidebar sections

The sidebar organises admin tools into logical groups:

| Group | Items |
|-------|-------|
| *(ungrouped)* | Dashboard |
| Catalogue | Products, Categories, Ingredients |
| Sales | Orders, Customers |
| Community | Wholesale, Testimonials, Events |
| Content | Marketing |
| Configuration | Theme / Appearance, Settings |

Each item has a small icon and highlights when active. Clicking an item navigates to the corresponding admin page.

## Dashboard

The dashboard at `/admin` shows:

- **Summary cards** — Total products, Active products, Total orders, Paid orders, Upcoming events, and a Wholesale placeholder.
- **Quick actions** — Links to the most common admin tasks.
- **Portal status** — A visual indicator showing which admin sections are fully built and which are placeholder foundations.

The summary cards pull live data from the backend API where available.

## Placeholder pages

The following sections have placeholder pages that describe what they will manage in the future. These pages are properly routed and accessible but do not yet contain working forms or data.

| Page | Future purpose |
|------|---------------|
| **Customers** | View and manage customer accounts, order history, loyalty details |
| **Wholesale** | Review applications, approve/reject wholesalers, manage seller compliance, suspend or remove accounts |
| **Testimonials** | Approve, edit, feature, or hide customer testimonials |
| **Marketing** | Manage hero banners, featured products, homepage sections, promotions |
| **Theme / Appearance** | Upload logo, set brand colours, control homepage layout blocks, trust badge settings, button styles, typography |
| **Settings** | Business contact details, Facebook link, shipping rules, payment settings, order defaults, SEO defaults |

## Existing working sections

These admin pages were built in earlier steps and continue to work within the new layout:

- **Products** — Full CRUD for the product catalogue (name, prices, images, stock, categories, ingredients).
- **Categories** — Create, edit, and deactivate product categories.
- **Ingredients** — Create, edit, and delete ingredients.
- **Events** — Create, edit, publish/unpublish, and feature events.
- **Orders** — View recent orders with status, customer details, shipping, and line items.

## Technical notes

- **Routing**: Admin routes are defined as a separate top-level route group in `AppRouter.tsx`, outside the `MainLayout` wrapper. This ensures the admin layout replaces the storefront layout entirely.
- **Styling**: The admin portal uses Tailwind CSS `slate` colour palette (instead of the storefront's `neutral` palette) to visually distinguish it from the customer-facing site.
- **Responsive**: The sidebar collapses to an overlay on screens below the `lg` breakpoint. The content area is scrollable independently.
- **Guard reuse**: The `AdminProtectedRoute` component can wrap any future admin route groups without modification.

## Product management (Step 2)

The Products area is now a working admin module designed for day-to-day business use.

### What admin can do now

- View products in a clean admin table at `/admin/products`
- Search products by name
- Filter by category
- Filter by status (all, active, inactive)
- See product image, name, category, retail price, wholesale price, stock, active status, and featured status
- Open edit screen for any product
- Quickly toggle:
  - active/inactive (show or hide from storefront)
  - featured/non-featured
- Deactivate products without deleting product data

### Product creation

Admins can add products at `/admin/products/new`.

The form includes:

- name
- slug (optional, auto-generated if left blank)
- short description
- full description
- how to use
- retail price
- wholesale price (optional)
- compare-at price (optional)
- image URL
- stock quantity
- category selection
- ingredient selection
- featured toggle
- active toggle

The form shows clear field-level validation and backend error messages when save fails.

### Product editing

Admins can edit products at `/admin/products/:id/edit`.

- Existing data is preloaded from backend
- Existing category/ingredient selections are preserved and visible
- Image URL can be updated with a small preview shown in the form
- Save returns to the products list with success feedback

### Backend support

Existing backend admin product endpoints were reused:

- list products
- get product by ID
- create product
- update product
- deactivate product (soft hide)

One small backend enhancement was added for admin list usability:

- admin list now returns product category relation and wholesale price in each row so the table can show complete business data without extra fetches.

## Orders management (Step 3)

The Orders area is now a dedicated admin workflow with both list and detail pages.

### What admin can do now

- View orders in a clear table at `/admin/orders`
- See order ID, customer name/email, created date, total amount, order status, and payment status
- Search orders by customer name or email
- Filter by order status
- Filter by payment status
- Open a dedicated detail page for each order

### Order details page

Admins can open `/admin/orders/:id` to see full order context:

- order ID and timestamps
- customer name, email, phone
- shipping address and shipping amount
- shipping method wording ("Australia Post (standard)")
- notes (if provided)
- line items with quantity, unit price, line total
- subtotal, shipping, and total
- order status and payment status badges
- available payment reference fields when present (Square order ID / provider reference)

### Order status updates

From the order detail page, admins can now update the **order status** using existing backend enum values:

- `PENDING`
- `AWAITING_PAYMENT`
- `PAID`
- `PAYMENT_FAILED`
- `CANCELLED`

The UI provides clear save confirmation and backend validation errors if an invalid value is submitted.

### Backend support

Existing admin order APIs were reused and extended minimally:

- `GET /api/admin/orders` now supports optional `search`, `status`, and `paymentStatus` filters
- `GET /api/admin/orders/:id` now includes payment reference fields (when available)
- `PUT /api/admin/orders/:id/status` was added for order status updates

All routes remain protected by existing admin auth/role middleware.

## Wholesale management (Step 4)

The Wholesale area is now a working moderation module for wholesale applications and accounts.

### What admin can do now

- View wholesale applications/accounts in a table at `/admin/wholesale`
- See business name, applicant name, email, status, and created date
- Search by business name, applicant name, or email
- Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`)
- Open a dedicated detail page for each wholesaler

### Moderation actions

Admins can moderate wholesale users with safe actions:

- **Approve** — grants approved wholesale state and enables wholesale pricing access
- **Reject** — marks application as rejected (user does not get wholesale pricing)
- **Suspend** — disables the account (`isActive = false`) to block access safely without deleting data

Actions use confirmation prompts to reduce accidental moderation mistakes.

### Wholesale detail page

At `/admin/wholesale/:id`, admins can review:

- business name
- applicant name
- email
- phone (when available from latest order profile)
- ABN
- current approval/moderation status
- application notes
- created/updated timestamps
- approved timestamp (if approved)

### Product compliance foundation

A product compliance section is included on wholesaler detail pages.

- The backend currently does **not** model direct wholesaler-product ownership.
- Because of this, the UI clearly shows a prepared placeholder state and explains that backend relationship expansion is required before real product-level compliance actions can be wired.
- No fake controls are implemented.

### Backend support

Existing auth/admin protections were reused. Minimal backend additions were made:

- `GET /api/admin/wholesale` — list wholesalers with search + status filter
- `GET /api/admin/wholesale/:id` — wholesaler detail
- `PUT /api/admin/wholesale/:id/moderation` — approve/reject/suspend action endpoint

All wholesale admin routes are protected with existing `requireAuth` + `requireRole([ADMIN])`.

## Content, Testimonials, Events, and Marketing (Step 5)

Step 5 adds practical content controls so Jane can update storefront messaging and social proof without developer help.

### Testimonials management

The admin Testimonials page at `/admin/testimonials` is now a working management area.

Admins can:

- view testimonials in a list
- search by customer name or testimonial text
- add a testimonial
- edit a testimonial
- hide/unhide a testimonial (visibility control)
- feature/unfeature a testimonial
- remove a testimonial when needed

Public testimonial pages now load from backend-managed testimonial content, so visibility changes affect the live site.

### Events management improvements

The Events admin page at `/admin/events` was improved for content operations:

- list rows now show date, location, published state, and featured state clearly
- quick feature/unfeature action added
- publish/unpublish controls remain in place
- create/edit form validates date range (end must be after start)

This keeps events usable as marketing content with safer publishing controls.

### Marketing content controls

The Marketing page at `/admin/marketing` is now a real editable form for key storefront text blocks.

Editable groups include:

- Homepage hero heading
- Homepage subtext
- Tagline emphasis text
- Featured products section heading
- "Our Ingredients" heading + supporting text
- Testimonials section heading + subheading
- Facebook page URL
- Footer trust wording

These fields are saved to a minimal content store and used by public pages.

### Featured content control

Featured content is now manageable in practical ways:

- featured products: controlled from product admin
- featured events: controlled from events admin
- featured testimonials: controlled from testimonials admin

### Backend support added

No architecture redesign was introduced. Minimal content routes were added:

- Public:
  - `GET /api/testimonials`
  - `GET /api/content/marketing`
- Admin:
  - `GET /api/admin/testimonials`
  - `POST /api/admin/testimonials`
  - `PUT /api/admin/testimonials/:id`
  - `DELETE /api/admin/testimonials/:id`
  - `GET /api/admin/content/marketing`
  - `PUT /api/admin/content/marketing`

These are intentionally lightweight and student-friendly, backed by a small file-based content store.

## Theme, Appearance, and Business Settings (Step 6)

Step 6 adds safe, practical controls for brand appearance and business-facing wording without introducing a risky full design editor.

### Theme / Appearance page

The Theme page at `/admin/theme` is now a working settings form with controlled inputs.

Admins can now update:

- primary brand color
- secondary/accent color
- button emphasis mode (solid or soft)
- homepage hero emphasis toggle
- trust badge visibility toggle
- trust badge heading text
- header logo path/reference
- footer logo path/reference
- optional trust badge icon path reference

The controls are intentionally limited to safe fields so site consistency is preserved.

### Business Settings page

The Business Settings page at `/admin/settings` is now a working settings form for practical site/business details.

Admins can now update:

- business display name
- footer location wording
- footer supporting contact text
- Facebook page URL
- footer trust strip wording
- shipping method label (display wording)
- shipping amount display text
- shipping carrier wording
- shipping explanatory note
- Australia Post carrier wording

### Shipping settings scope (safe version)

- Checkout pricing logic remains fixed at the existing flat `$12` rule in backend/frontend shipping logic.
- New shipping fields currently control customer-facing wording and confidence text.
- This keeps behaviour safe now, while preparing clean settings data for a future shipping-rule extension.

### Backend/content-store extension

Step 5's file-backed content architecture was reused and extended with two new records:

- `theme` settings block
- `business` settings block

New lightweight endpoints were added:

- Public:
  - `GET /api/content/theme`
  - `GET /api/content/business`
- Admin:
  - `GET /api/admin/content/theme`
  - `PUT /api/admin/content/theme`
  - `GET /api/admin/content/business`
  - `PUT /api/admin/content/business`

### Storefront integration

Public pages now consume these settings where safe:

- footer business/contact wording and Facebook URL
- footer trust strip wording
- trust-badge strip visibility + heading
- logo path override support (header/footer)
- controlled homepage visual emphasis options
- cart shipping wording/support note text

## Step 7 - Final Admin Integration and Polish

Step 7 focuses on consistency, terminology, UX polish, and integration confidence across the full admin portal.

### Final polish outcomes

- Navigation labels and page headings were aligned so sections are easier to scan.
- Status badges were standardized across Products, Orders, Wholesale, Events, and Testimonials.
- Action wording was cleaned up to reduce confusion (for example visibility/status language and safer destructive labels).
- Success and error feedback was improved for common admin actions.
- Empty-state wording was made clearer and more business-friendly.

### Integration readiness summary

The admin portal now has connected end-to-end flows for:

- products (including storefront visibility and featured controls)
- orders and payment/order status monitoring
- wholesale approval moderation
- testimonials visibility and featured controls
- events publish/unpublish and featured controls
- marketing homepage/footer content
- theme settings and business/footer settings

### Safety and scope

- Confirmation prompts are in place for destructive actions where applicable.
- Visibility/state controls are preferred for normal operations.
- The system remains intentionally simple, with controlled settings rather than high-risk free-form site editing.

### Demo readiness

The admin portal is now production-ready for demonstration use:

- practical business controls are available
- UX is consistent and understandable for non-technical admin users
- architecture remains lightweight and scalable for future extensions

## Demo admin URL and credentials

### Access behaviour

- **URL:** `/admin` on the storefront app (direct link only for customers; optional **Admin** link appears in the header when a logged-in user has the `ADMIN` role).
- **Not logged in:** `/admin` redirects to `/login` with return path saved so after login the user returns to `/admin`.
- **Logged in, not admin:** `/admin` redirects to the homepage (`/`).
- **API:** All `/api/admin/*` routes remain protected with `requireAuth` + `requireRole(ADMIN)`.

### Demo account (development)

From the `backend` folder, run once per environment (idempotent):

```bash
npm run seed:demo-admin
```

Default demo login:

- **Email:** `admin@byceleste.com`
- **Password:** `Admin123!`

The seed refreshes this user’s password and `ADMIN` role on each run when using `seed:demo-admin`, so demos stay predictable. For production, use strong secrets, do not rely on the demo password, and prefer `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` with `npm run seed:admin` where the user is only created if missing.

### Local dev URL

With the default Vite port, the storefront (including `/admin`) is at `http://localhost:5174`. Ensure `FRONTEND_ORIGIN` in the backend `.env` matches that origin so login cookies and CORS work.

### Deployed site

Use your real site origin, e.g. `https://your-site.example/admin`. The frontend must call the API with `credentials: 'include'` (already the case) and the backend must set `FRONTEND_ORIGIN` to that same origin. For cross-subdomain API hosting (e.g. Vercel + Render), you may need `AUTH_COOKIE_SECURE=true` and `AUTH_COOKIE_SAMESITE=none` so the browser sends the auth cookie on API requests.
