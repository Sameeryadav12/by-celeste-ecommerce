# Customer dashboard (Account)

## Purpose

This note explains what **customers** can see after **Step 8** when they open **Account** on the By Celeste website.

## What customers see

- A **greeting** and their **profile** (name, email, role).  
- **Loyalty points** — current balance, how points are earned, and a short list of recent point movements.  
- **Order history** — orders that were placed **while signed in** (so the system could link the order to their account).  
- **Order details** — each order can be opened to show line items, quantities, prices, delivery address, optional notes, and payment/order status.

## What order history includes

- **When** the order was created.  
- **Statuses** that help the customer understand whether payment completed.  
- **Money** totals that match what was calculated on the server at checkout.  
- **Products** as they were named and priced at purchase time (snapshots), even if the live shop catalog changes later.

## How this supports repeat business

Customers can **trust** that their past spending is visible, and **loyalty** gives a gentle reason to return. The design stays **calm and minimal** so it fits a premium skincare brand without feeling like a complex “portal.”

## Related technical routes (for students)

- `GET /api/account/orders` — list my orders  
- `GET /api/account/orders/:id` — detail for one order (only if mine)  
- `GET /api/account/loyalty` — balance + recent transactions + earn copy  

All require a **logged-in** session.

## Testing checklist (Step 8)

1. **Migration:** from `backend/`, run `npx prisma migrate dev` (or `prisma migrate deploy` in deployment). Then `npx prisma generate` if needed.  
2. **Account dashboard:** sign up or log in as a customer → open **Account** → you should see profile, loyalty (0 if new), and empty orders or your list.  
3. **Loyalty balance:** after a **logged-in** checkout completes and the **webhook** marks the order **PAID**, refresh Account → balance should increase by **floor(order total AUD)**.  
4. **Order list / detail:** complete checkout while logged in → order appears → **View details** opens `/account/orders/:id` with lines and address.  
5. **Other user’s order:** copy another user’s order id into the URL while logged in as you → expect **404** / not found message (no data leak).  
6. **Guest order:** checkout **logged out** → pay → no loyalty rows for that user (guest has no `userId`).  
7. **Single award:** trigger webhook retry or second `payment.updated` for the same paid order → points should **not** double (unique earn-per-order + idempotent webhook).  
8. **Logged out:** open `/account` → redirect to **Login** with session check message first.

**Note:** If you have **no** paid orders yet, loyalty stays at **0** until a successful webhook for a **linked** order.
