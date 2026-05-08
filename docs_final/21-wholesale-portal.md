# Wholesale Portal (Foundation)

## What it is
The Wholesale Portal is a dedicated dashboard area for approved wholesale partners.
It is separate from:

- the customer storefront
- the admin portal

## Who can access it
Access is restricted by two rules:

- you must be logged in
- your wholesale account must be approved (`wholesaleApprovalStatus === "APPROVED"`)

If you are not logged in, you are redirected to the login page.

If you are logged in but not approved yet, you will see:

> "Your wholesale account is pending approval"

and links back to the account page and the wholesale application/info page.

## Current features (Step 1: Foundation only)
This step intentionally provides structure only:

- route group at `/wholesale` with protected access control
- wholesale-specific layout (header + left sidebar + content outlet)
- sidebar navigation (expandable)
- basic pages:
  - `/wholesale` (dashboard)
  - `/wholesale/shop` (placeholder)
  - `/wholesale/orders` (placeholder)
  - `/wholesale/account` (placeholder)

Public wholesale application/info remains available at:

- `/wholesale/apply`

## Step 2 — Wholesale Shop
Approved wholesale users can browse products at `/wholesale/shop`.

- pricing is viewer-based (the same `GET /api/products` endpoint returns the correct unit price for the current viewer)
- wholesale cards show **Wholesale price** prominently and include an **RRP** reference when available
- adding to cart reuses the existing cart system and stores the viewer price (wholesale unit price) in the cart item

## Step 3 — Wholesale Orders
Approved wholesale users can manage their own order history in the wholesale dashboard:

- `/wholesale/orders` shows orders for the currently signed-in user (reuses `/api/account/orders`)
- `/wholesale/orders/:id` shows full order detail (reuses `/api/account/orders/:id`)
- totals and line items reflect the unit prices captured at checkout (wholesale where applicable)
- a **Reorder** button can repopulate the cart with the same items using current viewer-based wholesale pricing

## Step 4 — Wholesale Account
Wholesale users can view account details at `/wholesale/account`:

- account section shows full name, email, and account type ("Wholesale User")
- business section shows business name and ABN when available
- approval status is shown with a clear badge and status-specific explanation
- data is loaded from existing account/auth data (`GET /api/account/me` using the same safe user fields)

## Future features (not implemented yet)
Planned next steps (examples):

- wholesale product browsing with trade pricing and pack sizes
- wholesale checkout / ordering flow (bulk order rules)
- order history details, invoices, reorder
- support requests / contact workflows
- bulk ordering tools and saved order templates

