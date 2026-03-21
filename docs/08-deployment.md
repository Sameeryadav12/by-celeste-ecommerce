# Deployment

## Purpose

This document will explain how the website goes live, how it is hosted, and how updates are safely released.

## What will later go into this document

- Where the frontend is hosted and where the backend is hosted
- How the database is hosted and backed up
- What “environments” mean (development vs staging vs production)
- How updates are deployed and rolled back if needed
- Basic monitoring (uptime, error alerts) and who gets notified

## Square sandbox and webhooks (Step 7 — before production)

When you deploy or demo **real checkout**, you will need:

- **Square sandbox credentials** for safe testing (access token, location id).  
- A **public HTTPS URL** for webhooks in non-local setups (students often use a tunnel such as **ngrok** pointing at `POST /api/webhooks/square`).  
- The **webhook subscription signature key** and a **notification URL that matches character-for-character** what the backend uses to verify signatures.  
- **`CHECKOUT_SUCCESS_REDIRECT_URL`** set to your live or demo storefront success page (for example `https://your-site/checkout/success`). Square’s hosted checkout also uses the **redirect URL** returned by the API.

Production later switches to **production** Square tokens, production base URL (`https://connect.squareup.com`), and production webhook subscriptions.

