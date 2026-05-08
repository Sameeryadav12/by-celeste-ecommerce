# Wholesale flow (Step 9)

## Purpose

A quick scan for **Jane Watson**: what wholesale users can do **today**, and how it stays separate from retail.

## What wholesale users can do now

- Read about wholesale on the **Wholesale** page and **submit an application** (business name, optional ABN and notes, plus login credentials).  
- After applying, they are **signed in** and can open **Account** to see **approval status** and their **business name**.  
- When status becomes **APPROVED** (set by staff via database until an admin screen exists), the same **Shop** and **Product** pages show **wholesale unit prices** with a small, professional label.  
- **Checkout** recalculates totals on the server using those prices, so the amount charged stays trustworthy.

## How approval affects pricing

| Status   | What they see in the shop / cart / checkout |
| -------- | --------------------------------------------- |
| Pending  | Retail pricing only (same as public site)   |
| Rejected | Retail pricing only                         |
| Approved | Wholesale price when set; otherwise retail  |

Guests and **CUSTOMER** accounts always see **retail** pricing.

## Why this helps Jane

- **Retail** shoppers get a simple, consistent experience.  
- **Trade** buyers get recognition and correct pricing **only after** approval.  
- One codebase serves both groups, which is easier to maintain for a small brand.

## Testing tips (students)

1. Run **migrations** and (optionally) `npm run seed:catalog` so products include sample `wholesalePrice` values.  
2. Apply on **Wholesale** → confirm **pending** and retail prices in shop.  
3. In SQL or a DB GUI: set `wholesaleApprovalStatus` to `APPROVED` and set `approvedAt` for that user → refresh shop as that user → wholesale prices appear.  
4. Complete checkout and confirm the **order** line items match wholesale unit prices.
