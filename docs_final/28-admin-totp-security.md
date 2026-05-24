# Admin TOTP two-factor authentication (production security)

## Purpose

This note describes **optional** time-based one-time passwords (**TOTP**) for **administrator** accounts only—using an authenticator app (for example Google Authenticator). **SMS is not used.** Retail customers are **not** required to enroll. The same pattern could be extended to wholesale staff later without changing shopper flows.

This is a **production security improvement**: it adds a second factor after email and password for admins who choose to enable it.

---

## Who it applies to

| Audience | TOTP today |
|----------|------------|
| **ADMIN** | Optional; configurable under **Admin → Security**. |
| **CUSTOMER** | Not offered on the storefront login. |
| **WHOLESALE** | Not required; could reuse the same backend pattern in a future iteration. |

---

## User flows

### Setup (admin signed in)

1. Open **Admin → Security**.
2. Choose **Set up authenticator** (or **Show QR code again** if a previous setup was not finished).
3. The system shows a **QR code** (and an `otpauth://` URL for manual entry).
4. The admin scans the QR in their authenticator app (issuer **By Celeste**).
5. The admin enters the **6-digit code**; on success, **2FA is enabled** for that user.

### Login (admin with 2FA enabled)

1. Enter **email** and **password** as usual.
2. If 2FA is enabled, the API responds with a short-lived **pending** token (not a full session).
3. The login screen asks for the **6-digit authenticator code**.
4. After verification, the server issues the normal **session cookie** and admin access proceeds.

### Disable

- From **Admin → Security**, the admin enters their **account password** to turn off 2FA and clear the stored secret.

---

## Technical summary (for developers)

- **Library:** `otplib` (RFC 6238 TOTP) and `qrcode` for PNG-in-data-URL QR images on the server.
- **Storage:** `User.totpEnabled` (boolean) and encrypted `totpSecretEncrypted` (AES-256-GCM). The plaintext secret is never sent to the client after setup.
- **Encryption key:** Optional env **`TOTP_ENCRYPTION_KEY`** — **64 hex characters** (32 bytes). If omitted, a key is **derived from `JWT_ACCESS_SECRET`** (acceptable for local dev; **set a dedicated key in production** so TOTP secrets stay protected if JWT secrets rotate).
- **API (admin, cookie auth):**
  - `GET /api/admin/security/totp/status`
  - `POST /api/admin/security/totp/setup-start`
  - `POST /api/admin/security/totp/setup-verify` body `{ "code": "123456" }`
  - `POST /api/admin/security/totp/disable` body `{ "password": "…" }`
- **API (login):**
  - `POST /api/auth/login` may return `requiresTwoFactor: true` and `twoFactorToken` instead of setting a session.
  - `POST /api/auth/login/totp` completes login with the pending token and code.

---

## Operations checklist

1. Run database migrations so `totpEnabled` / `totpSecretEncrypted` exist on `User`.
2. In production, set **`TOTP_ENCRYPTION_KEY`** to a random 32-byte value in hex (64 hex chars), stored in your secrets manager.
3. Ensure server time is accurate (NTP); TOTP verification depends on clock alignment.

---

## Related docs

- [03-authentication.md](./03-authentication.md) — sessions and cookies (including the 2FA step on login).
