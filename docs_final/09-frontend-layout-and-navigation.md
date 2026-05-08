# Frontend layout and navigation (Step 3)

## Purpose

This document explains, in plain English, how the main pages, header, and footer now work together on the By Celeste website.

## What pages now exist

As of Step 3, the storefront has a clear set of pages:

- **Home** – a calm introduction to the brand with links into the shop and events.  
- **Shop** – a simple product grid placeholder showing where real products will appear.  
- **Product detail** – a single-product view using the URL to carry a future ID or slug.  
- **Cart** – a placeholder for items and order totals.  
- **Checkout** – a placeholder for shipping, summary, and future secure payments with Square.  
- **About** – a high-level story and values overview for the brand.  
- **Events** – a future home for pop-ups and in-person events.  
- **Wholesale** – a starting point for stockists and partners.  
- **Login / Signup** – customer authentication pages from earlier steps.  
- **Account** – a simple signed-in account area, protected so only logged-in customers can see it.

These pages are mostly placeholders today, but the structure is now in place for content, products, and logic to be added later.

## What the header does

The header:

- Shows the **By Celeste** brand at the top of every page: **client logo** from `frontend/public/images/branding/` when provided (`logo.svg` / `logo.png`), otherwise the **text wordmark**.  
- Provides one simple navigation bar to Home, Shop, About, Events, Testimonials, Wholesale, and Cart.  
- Adjusts the account area based on whether the customer is logged in:
  - Logged out: shows **Login** and **Signup**.  
  - Logged in: shows **Account** and **Logout**.  
- Works on mobile and desktop, with a compact menu on smaller screens.

## What the footer does

The footer:

- Offers a short **brand/about** summary in plain language.  
- Lists **quick links** as placeholders for shop, events, and wholesale areas.  
- Includes **contact details** in the footer: location **Leneva Victoria, Australia** (centralised in `frontend/src/config/businessAddress.ts`). No street-level address is shown, per client preference for a clean, premium presentation.  
- Shows a clear copyright line so the site feels complete and professional.

## How this helps future development and client usability

This shared layout and navigation:

- Gives Jane a clear sense of the finished store, even before real data is plugged in.  
- Keeps the look and feel **calm, light, and premium**, matching a modern skincare brand.  
- Makes development easier, because changes to the header, footer, or navigation now happen in one place and automatically flow to every page.  
- Reduces duplication and mistakes as new features (products, events, orders, loyalty) are added in later steps.

