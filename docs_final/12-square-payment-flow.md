# Square payment flow (hosted checkout)

## Purpose

This short note is for **Jane Watson** and students: it explains what Square does in By Celeste **right now**, without jargon-heavy detail.

## Why hosted checkout was chosen

**Hosted checkout** means the customer types their card into **Square’s page**, not into By Celeste. That keeps the project **simpler and safer** while learning: no raw card data passes through our own frontend in Step 7, and PCI responsibilities stay on the payment provider’s side.

## What Square does in this project

- **Creates a secure payment page** when our backend asks for a **payment link**.  
- **Charges the customer** (in sandbox, with test card numbers).  
- **Redirects** the customer back to our **success URL** after payment.  
- **Notifies** our backend with **webhooks** when a payment changes state.

## The customer journey (end to end)

1. **Customer reviews the order** on the By Celeste checkout page (cart + delivery details + totals preview).  
2. **By Celeste creates a secure order record** in the database with line items and authoritative totals.  
3. **By Celeste redirects the customer to Square** to enter payment details on Square’s hosted checkout.  
4. **Square sends the customer back** to By Celeste’s **success** page (helpful, but not the final proof of payment).  
5. **Square tells our server through a webhook**, and the server updates **payment status** safely—this is the **reliable** confirmation.

## Where to read more in the codebase

- Backend: checkout session route under `/api/checkout`, Square client helper, webhook route under `/api/webhooks/square`.  
- Frontend: checkout page (handoff), `/checkout/success` and `/checkout/cancel` pages.  
- Environment variables: see `backend/.env.example`.

## Local testing tips (students)

1. Copy `backend/.env.example` values into your real `.env` and run database migrations.  
2. Use **Square sandbox** application credentials from the Square Developer Dashboard.  
3. Start the API and storefront, complete checkout, and use Square’s test card numbers.  
4. For webhooks on a laptop, expose the API with a tunnel and paste the **exact** tunnel URL into Square’s webhook settings **and** into `SQUARE_WEBHOOK_NOTIFICATION_URL`.  
5. If signature checks fail, re-check: **same URL**, **raw JSON body**, and the **signature key** for that subscription.

## Hands-on testing checklist (Step 7)

### Environment placeholders (copy into `backend/.env`)

| Variable | Example placeholder | What it is |
| --- | --- | --- |
| `SQUARE_ACCESS_TOKEN` | `EAAA...` (sandbox) | Sandbox access token from Square Developer Dashboard → Applications → your app → Credentials |
| `SQUARE_ENVIRONMENT` | `sandbox` | Use `sandbox` locally; `production` only when going live |
| `SQUARE_LOCATION_ID` | `L...` | Sandbox **location id** from Locations in the dashboard |
| `SQUARE_API_VERSION` | `2025-10-16` | Must be a version your app supports (see Square docs) |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | subscription signing key | Webhooks → your subscription → signature key |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | `https://xxxx.ngrok-free.app/api/webhooks/square` | **Exactly** the URL Square POSTs to (must match verification) |
| `CHECKOUT_SUCCESS_REDIRECT_URL` | `http://localhost:5173/checkout/success` | Backend builds `?orderId=` on redirect |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Needed for browser → API CORS + cookies |
| `DATABASE_URL` | your Postgres URL | After changing schema, run migrations |

### What to test

1. **Happy path:** fill checkout → submit → API returns `checkoutUrl` → browser lands on Square sandbox checkout.  
2. **Cancel:** close Square or use its cancel/back behaviour → open `/checkout/cancel` manually if needed (Square may not always redirect to a custom cancel URL).  
3. **Success return:** complete payment with a **sandbox test card** → Square redirects to `/checkout/success?orderId=...`.  
4. **Webhook:** confirm `payment.updated` hits your tunnel; order `paymentStatus` becomes **PAID** in the database / status API.  
5. **Bad cart:** tamper with `productId` in devtools → backend should reject with a clear error.  
6. **Out of stock:** set quantity higher than `stockQuantity` in DB → backend should reject **insufficient stock**.  
7. **Totals:** change a price in the database; new checkout should use the **new** server price (not an old cart price).  
8. **Success page:** should show **PAID** after webhook (may show pending briefly first).  
9. **Square down / misconfiguration:** expect a readable error on checkout and order marked **payment failed** if the link could not be created.

### Webhooks on your laptop (student-friendly)

1. Run the backend on port 4000.  
2. Start **ngrok** (or similar): `ngrok http 4000`.  
3. Copy the **HTTPS** forwarding URL, add `/api/webhooks/square`, and paste that full string into:  
   - Square Developer Dashboard → Webhooks → subscription **Notification URL**  
   - `SQUARE_WEBHOOK_NOTIFICATION_URL` in `.env` (**must match exactly**, including `https` and path)  
4. Subscribe to **`payment.updated`** (minimum for this step).  
5. Restart the backend after `.env` changes.

### If webhook signature validation fails

- Check server logs for `Invalid signature`.  
- Re-copy the **signature key** for the **same** subscription URL.  
- Confirm there is **no reverse proxy** altering the body (body must be raw JSON bytes).  
- Confirm the URL in code matches the dashboard **including trailing slashes** (best practice: **no** trailing slash on both).

### Getting sandbox token and location id (short)

1. Log into [Square Developer Dashboard](https://developer.squareup.com/).  
2. Open your **Sandbox** application.  
3. **Credentials** → copy **Sandbox Access Token**.  
4. **Locations** (or API Explorer) → copy the **Sandbox location id** for test payments.
