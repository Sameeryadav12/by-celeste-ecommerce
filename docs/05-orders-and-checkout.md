# Orders & Checkout

## Purpose

This document explains, in plain English, how shopping, checkout, and payments work today—including **Step 7**, where orders are stored in the database and payment happens on **Square’s hosted checkout**.

## What the cart does

- Customers can add products from Shop and Product Detail pages.  
- If the same product is added again, quantity increases rather than creating a duplicate row.  
- Customers can increase, decrease, or directly edit quantity in the Cart page.  
- Customers can remove items or clear the cart entirely.  
- Cart data is saved locally in the browser, so refresh does not lose the cart.

## Freight calculator on the cart (polish / client alignment)

The cart includes a **freight calculator** so shoppers see **shipping and a full total before checkout**:

- **Australian postcodes only:** exactly **4 digits**. Invalid input shows a clear message (for example: enter a valid Australian postcode).
- **Calculate shipping** applies the demo rules and updates the **order summary** (shipping row + grand total).
- **Rules (AUD, demo):** subtotal **under $120** → **$9.95** shipping; subtotal **$120 or more** → **free shipping**. When the cart already qualifies for free shipping, the page states that clearly—**no postcode is required**.
- **Checkout gate:** Until shipping is resolved (free-shipping tier **or** valid postcode + calculate), the summary shows **—** for shipping/total and **Continue to checkout** stays disabled—so the flow matches “show shipping cost before checkout.”
- If the subtotal **crosses** the free-shipping threshold (e.g. after quantity changes), any previously entered postcode is **cleared** so the customer is not shown a misleading “shipping to 3000” line when delivery is now free.

No extra packages are required for this; it is standard React state plus shared shipping helpers (`SHIPPING_CONFIG` / `calculateShipping`) aligned with the backend preview rules.

## What the checkout page does

- Shows a delivery form with customer and address details.  
- Validates key fields (name, email, phone, suburb, state, postcode, and more) clearly on screen.  
- Displays an order summary with subtotal, shipping estimate, and grand total (for customer confidence while browsing).  
- If the cart is empty, checkout shows a helpful message and links back to Shop.  
- On **Continue to Secure Payment**, the website talks to the backend; if everything is valid, the browser **redirects to Square** (loading state + errors are shown on the checkout page).

## What happens when a customer clicks “Continue to Secure Payment”

1. The frontend sends the **cart lines** (product id + quantity) and the **delivery form** to the backend.  
2. The backend **validates** the payload strictly (no trusting random browser data).  
3. The backend **reloads each product from the database**, checks it is **active**, checks **stock**, and **recomputes** line totals and the order subtotal.  
4. The backend applies **shipping rules** (see below) and computes the **final total**.  
5. The backend saves an **Order**, **Order items** (with name/slug/price snapshots), and a **Payment row** (provider = Square, status pending).  
6. The backend calls Square’s **Create payment link** API (`POST /v2/online-checkout/payment-links`) and stores Square’s **payment link id** (and Square order id when Square returns one).  
7. The backend responds with the **Square checkout URL**; the frontend sends the customer there.

If Square cannot create a link after the order is saved, the order is marked **payment failed** so it is obvious the checkout did not complete.

## Why totals are recalculated on the backend

The cart preview on the customer’s device is helpful, but it is **not authoritative**. Prices and stock can change, and a modified browser request should not be able to charge the wrong amount.

**Rule of thumb:** if the frontend and backend numbers disagree, **the backend wins**.

## How shipping is calculated

Shipping uses the same simple **AUD rules** as Step 6 (aligned between frontend preview and backend):

- Below the free-shipping threshold: a **standard flat fee**.  
- At or above the threshold: **free shipping**.

This is intentionally simple for coursework and demos. Later it can be replaced by a carrier integration (for example Australia Post or Sendle) **without changing the idea** that shipping belongs on the server.

## How Square hosted checkout works (simple terms)

- Square shows the **card entry and payment UI** on Square’s own website.  
- By Celeste never embeds a card form in this step.  
- After a successful payment, Square can redirect the shopper to a **success page** on By Celeste (with an order id in the query string so the page can look up status).

## Why the webhook matters

The success page is customer-friendly, but it is **not proof** on its own (someone could open the URL without paying).

Square therefore sends **signed webhook events** to the backend. The backend:

- Verifies the signature using Square’s **webhook signature key** and the **exact notification URL** registered in the developer dashboard.  
- Records each Square `event_id` once so **retries do not double-update** the database.  
- Updates **payment** and **order** status when Square reports a final payment state.

So: **redirect = helpful UX**, **webhook = reliable accounting**.

## Guest vs signed-in checkout

- **Guest checkout** is supported: the order can be saved **without** a user id.  
- If the customer happens to be **logged in**, the backend attaches their **user id** so the order can appear under **Account** after payment.

## After payment — account visibility (Step 8)

Once the order is **paid** (confirmed through the Square webhook flow):

- The order can show in the customer’s **Account** order list **if** it was linked to their user at checkout.  
- The customer can reopen **order details** any time (line items, delivery details, notes, payment status).  
- **Loyalty points** for that purchase are created only at this confirmed-paid stage (guest orders do not earn points on the account).

## What comes later

- **Admin** screens to search and fulfil orders.  
- Emails, receipts, and deeper Square features (if needed).

For a focused walkthrough of the Square pieces, see **`12-square-payment-flow.md`**.
