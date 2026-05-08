# Loyalty & Wholesale

## Purpose

This document describes **loyalty** and **wholesale** in plain English for Jane Watson. Step 8 added loyalty; **Step 9** adds wholesale pricing and applications.

## Loyalty — what points do now (Step 8)

- **Loyalty points** are a simple reward for completed purchases.  
- Each customer has a **points balance** shown in their **Account** area.  
- A full **history** of changes (earned, and later redeemed or adjusted) is stored for transparency.

### How points are earned (current rule)

- The customer earns **1 point for each whole Australian dollar** of the **order total** (after shipping is included).  
- Example: a **$45.20** paid total → **45** points.  
- Points are added only when payment is **confirmed successful** through the **Square webhook** (same moment the order is marked **paid**).  
- No points are given for items sitting in the cart, unpaid orders, failed payments, or cancelled checkouts.

### Why both a balance field and a transaction history?

- **`LoyaltyTransaction` rows** are the **audit trail**: every change has a type, description, and timestamp.  
- **`User.loyaltyPointsBalance`** is a **cached total** so the website can show the balance quickly (for example in the account header or API) without summing every row on every request.  
- The backend **updates both together** when new points are earned so they stay in sync.

### Idempotency (no double points)

- Square may **retry** webhooks; the backend already ignores duplicate webhook `event_id`s.  
- Additionally, the database enforces **at most one “earned” record per order**, so even unusual duplicate notifications cannot credit the same purchase twice.

### Where customers see loyalty

- **Account** dashboard: balance, short explanation, and recent activity.  
- The **auth “me”** response also includes the balance so the UI can stay fresh after login.

## Wholesale — what exists now (Step 9)

### What wholesale access means

- A **wholesale account** uses the **WHOLESALE** role and carries **approval status** separate from “customer vs admin”.  
- **Retail customers** are unchanged: they never see wholesale-only language unless they are on the **Wholesale** information page.

### How approval status works

- **`NONE`** — normal retail customers (default).  
- **`PENDING`** — application submitted; account can sign in, but **does not** receive wholesale prices yet.  
- **`APPROVED`** — wholesale unit prices apply in the shop and at checkout (where a product has a wholesale price).  
- **`REJECTED`** — application declined; the user still sees **retail** prices.

**Important rule:** wholesale pricing requires **both** `role = WHOLESALE` **and** `wholesaleApprovalStatus = APPROVED`.

### Product wholesale prices

- Each product keeps a **retail price** (required) and an optional **wholesale price** (normally ≤ retail).  
- If wholesale price is missing, approved wholesale buyers pay **retail** for that SKU.

### Where applications happen

- The **Wholesale** page includes an **application form** that creates a pending wholesale login.  
- **Account** shows business name and status for wholesale users.

### What is still to come (later steps)

- **Admin UI** to approve or reject applications without using the database directly.  
- **Minimum order rules**, price lists per account, and deeper B2B reporting.

### How loyalty relates

- Wholesale buyers can still earn loyalty like other signed-in shoppers once payment is confirmed; there is no special wholesale loyalty rule in this step.

## What will later go into this document

- MOQs and staff **approval screens**  
- How (or if) loyalty differs for wholesale buyers in future  
- Reporting needs for staff (high level)

See also **`14-wholesale-flow.md`** for a short client-facing walkthrough.
