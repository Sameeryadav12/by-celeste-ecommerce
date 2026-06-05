# Client handover guide

Plain-language guide for **Jane** and the By Celeste team. Technical setup is in [01-setup-guide.md](./01-setup-guide.md). Going live is in [08-deployment.md](./08-deployment.md).

---

## How to log in

1. Open your website and go to **Login** (or visit `/login`).
2. Sign in with **admin.byceleste@gmail.com** and the password set during handover setup.
3. Open **Admin** (or go to `/admin`).
4. **Change your password** after first login (Account or profile flow as provided).
5. Optional: turn on **two-factor authentication** under **Admin → Security**.


---

## Using the admin portal

| Task | Where in admin |
|------|----------------|
| Overview, Square status, low stock | **Dashboard** |
| Add / edit / hide products | **Products** |
| Upload product photos | **Products → Add/Edit → Upload image** |
| Orders | **Orders** → open an order for details |
| Customers | **Customers** |
| Wholesale applications | **Wholesale** → Approve or reject |
| Events | **Events** → Publish when ready |
| Testimonials | **Testimonials** |
| Homepage / footer text, social links | **Marketing** |
| Colours / branding | **Theme** |
| Business details, shipping wording | **Settings** |
| Extra security | **Security** (2FA) |
| Download spreadsheets | **Products** or **Orders** → **Export CSV** |

---

## Manage products

1. Go to **Admin → Products**.
2. Click **Add product** or **Edit** on a row.
3. Fill in name, price, descriptions, stock, and category.
4. Upload an image (see below) or paste an image link.
5. Click **Save**.

**Hide** removes a product from the shop but keeps past orders. **Delete** is permanent (only on the edit screen, with confirmation).

---

## Upload images (products and events)

**Products:** Admin → Products → Add/Edit → **Upload image** (JPG, PNG, or WebP, max 5MB) → **Upload** → image URL fills in → **Save**.

**Events:** Admin → Events → same pattern for optional event photos.

---

## Manage orders

1. **Admin → Orders** lists all orders (newest first).
2. Open an order to see items, customer, payment status, and shipping.
3. Update status if your workflow requires it.
4. Use **Export CSV** for a spreadsheet of filtered orders.

Order numbers look like **BC-1000**, **BC-1001**, etc.

---

## Testimonials

1. **Admin → Testimonials**.
2. Add a new testimonial or edit an existing one.
3. Use hide/show to control what appears on the public testimonials page.

---

## Events

1. **Admin → Events**.
2. Create or edit an event (date, location, description).
3. Add an optional image (upload or URL).
4. Tick **Published** when it should appear on the public **Events** page.
5. **Unpublish** to hide without deleting.

---

## Wholesale customers

1. Customers apply on the public **Wholesale** application page.
2. **Admin → Wholesale** lists applications.
3. Open an application and **Approve** or **Reject**.
4. Approved users sign in and use **/wholesale** (50% off retail pricing).

---

## Discount coupons

Manage all coupons under **Admin → Discounts**.

| Field | Meaning |
|-------|---------|
| Coupon code | Customer-typed code (auto-uppercased, e.g. `birthday20` → `BIRTHDAY20`) |
| Discount percentage | Whole number 1–100, e.g. `20` for 20% off |
| Applies to customers | Tick to allow retail customers to use this code |
| Applies to wholesale | Tick to also allow approved wholesale accounts to use this code |
| Start / end date | Optional window when the code is valid |
| Total usage limit | Optional cap on how many times the code can be redeemed in total |
| Per customer limit | Default `1` — one redemption per customer (uses account id or email) |
| Active | Untick to switch the code off without deleting it |

Rules:

- The discount is applied to the **cart subtotal** **before** the flat **$12** shipping fee.
- Wholesale already pays 50% of retail. A coupon only works for wholesale accounts when *Applies to wholesale* is ticked. Otherwise the customer sees: *“This coupon is not available for wholesale orders.”*
- Coupon usage is only recorded once the order is paid (Square webhook). Cancelled or failed payments do not consume a coupon.
- A coupon you **deactivate** stops working immediately for new orders; previously paid orders keep their discount on record.

### Demo coupon

After running `npm run seed:local` (or `npm run seed:discount-coupons`), the following demo coupon exists:

| Code | Percent | Audience | Per customer | Total limit |
|------|---------|----------|--------------|-------------|
| `BIRTHDAY20` | 20% | Customers | 1 | 200 |

Use it in the cart to verify the discount line and updated total.

---

## Emails (Brevo SMTP)

By Celeste uses **Brevo** (Sendinblue) to send transactional emails:

| When | Who receives it | Subject |
|------|----------------|---------|
| Customer clicks **Forgot password** | The customer | *Reset your By Celeste password* |
| Visitor submits a wholesale application | `ADMIN_NOTIFICATION_EMAIL` | *New wholesale application - By Celeste* |
| Order is paid for the first time | `ADMIN_NOTIFICATION_EMAIL` | *New order received - BC-XXXX* |

The mailbox at `ADMIN_NOTIFICATION_EMAIL` is the operational inbox for Jane / the team. Set it on Render alongside the SMTP credentials.

What Jane needs to do once:

1. Create a Brevo account and verify the sender (`MAIL_FROM_EMAIL`, e.g. `hello@byceleste.com.au`).
2. Generate an SMTP key under **Settings → SMTP & API → SMTP**.
3. Provide the SMTP login + key to the developer to paste into Render env vars.
4. Optional but recommended before launch: add SPF/DKIM for `byceleste.com.au` in Brevo so emails go to inbox, not spam.

If SMTP is not configured yet, the password reset still works — the link is printed in the backend console (developer use only) and the public message stays the same: *"If an account exists for this email, a reset link will be sent."*

---

## Square payments

- Until Square is connected, checkout shows: *Online payment is not connected yet. Please contact By Celeste.*
- **Admin → Dashboard** shows **Square readiness** (connected or not, and what is still missing — no secret keys shown).
- Jane must provide **production** Square credentials and complete the go-live checklist below.

---

## Still needed before go-live

1. Square production setup and one real test payment  
2. Domain **www.byceleste.com.au** pointed to live hosting  
3. Final product photos (if not all uploaded yet)  
4. Final policy / legal wording on policy pages  
5. Agreed launch date  

---

## Business details

| Item | Value |
|------|--------|
| Business name | By Celeste |
| ABN | 42 491 484 966 |
| Support email | jane.byceleste@gmail.com |
| Phone | 0403 823 357 (About page and wholesale support only) |
| Address | 10 Mortimer Tce, Leneva VIC 3691 |
| Website | www.byceleste.com.au |

Footer shows name, ABN, address, email, and website — not phone (keeps footer clean).

**Social links:** Facebook and Instagram appear together in the footer Contact section when URLs are set.

- **Admin → Marketing → Footer and social links** — Facebook page URL, Instagram profile URL (saved with marketing content).
- **Admin → Settings → Social links** — same fields on business settings (either source works; business URL wins if both are set).

Default Instagram: [instagram.com/by_celeste1](https://www.instagram.com/by_celeste1/). Clear Instagram to hide it (no broken link).

## Admin portal account

| Field | Value |
|-------|--------|
| Admin portal login | admin.byceleste@gmail.com only (other emails cannot access `/admin`) |
| Role | ADMIN |
| Password | Set once by your developer using `npm run seed:jane-admin` and `ADMIN_PASSWORD` in server config — **not stored in this document** |

Change this password after first login (strong unique password; optional admin 2FA under Admin → Security). Customer and wholesale support stays **jane.byceleste@gmail.com** on the storefront.

Your developer runs once (does not duplicate if the account already exists):

```bash
cd backend
npm run seed:jane-admin
```

Use a strong password for the production admin account; change it after first login.

## Payments (Square)

Orders use customer-facing numbers **BC-1000**, **BC-1001**, … (not long database ids).

### Jane go-live checklist

1. **Square production access** — Jane provides production app credentials from the Square Developer Dashboard (not sandbox).
2. **Backend env on Render** — set:
   - `SQUARE_ACCESS_TOKEN`
   - `SQUARE_LOCATION_ID`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - `SQUARE_WEBHOOK_NOTIFICATION_URL` = `https://YOUR-API-HOST/api/webhooks/square` (must match Square dashboard exactly)
   - `SQUARE_ENVIRONMENT=production`
   - `CHECKOUT_SUCCESS_REDIRECT_URL` = `https://www.byceleste.com.au/checkout/success` (or your live storefront URL)
3. **Test one live payment** — small real order; confirm admin shows **Payment: PAID** and **Order: CONFIRMED**.
4. **Confirm go-live** — remove demo-only seeds from production; keep failed test orders visible for troubleshooting.

Until Square env vars are set, checkout shows: *Online payment is not connected yet. Please contact By Celeste.* (no broken payment attempt).

### Demo paid order (local / staging)

`npm run seed:local` ensures one demo order with **PAID** payment and **CONFIRMED** status so the admin orders list is not only failures.

Webhook + redirect URLs must match your live domain in Square and backend env.

## Wholesale pricing

- Approved wholesale accounts pay **50% of retail** (shop, bulk orders, cart, checkout). UI shows wholesale + RRP.
- **Wholesale minimum order:** approved wholesale buyers need at least **$300 product subtotal before shipping**. Shipping does not count. Retail customers and guests are not affected. Discount coupons do not bypass this minimum — eligibility uses the pre-discount product subtotal.
- The wholesale portal shows: **“Wholesale pricing is 50% off retail pricing.”** and the $300 minimum note (dashboard, shop, bulk orders, cart when wholesale items are in cart).
- **Wholesale support** card: jane.byceleste@gmail.com — *For wholesale questions, contact By Celeste.* (dashboard, shop, bulk orders; full page under **Support**).
- Wholesale users **buy products only** — they cannot list or sell products on the site.
- Apply and approve accounts under **Admin → Wholesale**.

## Shipping

- **Flat rate: $12 per order** (AUD).
- No free shipping threshold.
- No bulk shipping discount.
- Applied in cart, checkout, and backend order totals.

Wording can be edited in **Admin → Settings**; the $12 amount is fixed in code until changed in `shippingRules.ts`.

## Events

**Admin → Events**: create, edit, **Publish** / **Unpublish**. The public site and `/events` only show **published** events.

**Event image (optional):** upload JPG/PNG/WebP (max **5MB**) or paste an image URL. Upload fills the URL field (for example `/uploads/events/….webp`) and shows a preview. Save the event to keep the image.

## Admin dashboard (handover polish)

**Admin → Dashboard** includes:

- **Square readiness** — Connected / Not connected; lists missing env vars (`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`) without showing secrets.
- **Low stock** — Active products with stock ≤ 5; link to edit each product.
- **Policy status** — Shipping, returns, privacy, terms, wholesale terms; **Needs final wording** until the pending note is removed from `frontend/src/config/policies.ts`.

**Admin → Products** and **Admin → Orders** — **Export CSV** uses current search/filters (up to 500 rows).

## Policy pages

Live at `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms`, `/policies/wholesale-terms`.

Each page includes: **“Final wording to be confirmed by By Celeste.”** — replace with Jane’s legal text when ready. Remove `POLICY_PENDING_NOTE` from that policy in `frontend/src/config/policies.ts` to mark it **Ready** on the dashboard.

## Product content and images

- Product copy should match the current By Celeste range (seed/catalog as baseline).
- **Final product images** to be uploaded when supplied by Jane (expected late next week).
- Until then, keep existing image URLs; use **Admin → Products → Upload** (Sharp → WebP, max 5MB).

## Admin product images

**Admin → Products → Add/Edit product → Product image**

1. Choose a file (JPG, PNG, or WebP, max **5MB**).
2. Click **Upload**.
3. The **image URL** field fills automatically (for example `/uploads/products/….webp`).
4. Preview appears; save the product.

**Hide vs delete:** On the product list, use **Hide** to remove a product from the shop (keeps database + order history). Permanent delete is only on the edit screen (double confirmation) for mistaken entries.

**Advanced:** open **Paste image URL** for external links or existing paths (`/images/…` from seed data).

### Image optimization

Uploads are processed on the server with **Sharp**:

- Resized to max **1200px** width (no upscale)
- Saved as **WebP** for smaller files

### Storage (important)

- **Local development:** `backend/uploads/products` and `backend/uploads/events`, served at `/uploads/products/…` and `/uploads/events/…`.
- **Render / similar free hosting:** disk may **not persist** after redeploy.
- **Production:** plan **Cloudinary, S3, or similar** for durable storage (not built in yet).

## Admin customers

**Admin → Customers** lists registered accounts (search, role, and status filters).

- Open **View** for profile, spending summary (paid orders), loyalty points, wholesale status (if applicable), order history, and **private admin notes** (staff-only).
- **Email customer** opens your mail app (`mailto:` link).
- **Export CSV** downloads the current filtered list (up to 500 rows) with order and spend totals.
- Admin accounts are hidden from the list (retail and wholesale only).
- **Deactivate / Reactivate** asks for confirmation first (customer and wholesale accounts only; not admins).
- Password reset is not implemented in this build.

Demo retail customer exists only on developer machines — see [02-demo-accounts-and-seeding.md](./02-demo-accounts-and-seeding.md).

## Related docs

- [01-setup-guide.md](./01-setup-guide.md)
- [02-demo-accounts-and-seeding.md](./02-demo-accounts-and-seeding.md)
- [08-deployment.md](./08-deployment.md)
- [04-products.md](./04-products.md)
- [06-loyalty-and-wholesale.md](./06-loyalty-and-wholesale.md)
