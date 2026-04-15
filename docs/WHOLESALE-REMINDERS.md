# Wholesale — saved reminders

## Not complete yet

Wholesale is **partially implemented**: applications, admin moderation, portal gating, and pricing rules exist, but end-to-end polish (notifications, email flows, edge cases) is **not finished**. Treat wholesale as **in progress** until this file is cleared or replaced.

## TODO: notify user on approval

When an admin **approves** a wholesale application, the user should receive a **message** (e.g. transactional **email** and/or in-app notice) that their application was approved and they can use the wholesale portal.

**Likely touchpoints when implementing:**

- Backend: wholesale moderation handler after status → `APPROVED` (e.g. `adminWholesale.service` or related controller).
- Add email provider (or queue) if not present; reuse patterns from order/confirmation mail if any.
- Optional: same for **rejection** with appropriate copy.

---

*Added as a reminder per project request; update or delete when done.*
