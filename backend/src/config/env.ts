function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function parseBoolean(value: string, fallback: boolean) {
  const v = value.trim().toLowerCase()
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return fallback
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  PORT: Number(process.env.PORT ?? 4000),

  /**
   * Browser origin for CORS + cookies. In development, defaults to Vite so Shop/API work even if
   * `.env` omits this (avoids "Failed to fetch" from blocked cross-origin requests).
   */
  FRONTEND_ORIGIN:
    process.env.FRONTEND_ORIGIN?.trim() ||
    (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5174'),

  DATABASE_URL: getEnv('DATABASE_URL'),

  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '7d',

  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME ?? 'by_celeste_access',
  AUTH_COOKIE_SECURE: parseBoolean(process.env.AUTH_COOKIE_SECURE ?? '', false),
  AUTH_COOKIE_SAMESITE:
    (process.env.AUTH_COOKIE_SAMESITE as 'lax' | 'strict' | 'none' | undefined) ??
    'lax',
  AUTH_COOKIE_DOMAIN: process.env.AUTH_COOKIE_DOMAIN || undefined,
  AUTH_COOKIE_MAX_AGE_DAYS: Number(process.env.AUTH_COOKIE_MAX_AGE_DAYS ?? 7),

  /**
   * Square (Step 7). Optional at process start; checkout/webhook validate when called.
   * sandbox → https://connect.squareupsandbox.com, production → https://connect.squareup.com
   */
  SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN?.trim() || undefined,
  SQUARE_ENVIRONMENT: (process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === 'production'
    ? 'production'
    : 'sandbox') as 'sandbox' | 'production',
  SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID?.trim() || undefined,
  /** API version header (see Square API reference). */
  SQUARE_API_VERSION: process.env.SQUARE_API_VERSION?.trim() || '2025-10-16',
  /** Webhook subscription signature key from Square Developer Dashboard. */
  SQUARE_WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() || undefined,
  /**
   * Must match the notification URL in Square exactly (e.g. https://abc.ngrok-free.app/api/webhooks/square).
   * Used for HMAC verification with the raw request body.
   */
  SQUARE_WEBHOOK_NOTIFICATION_URL: process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() || undefined,

  /**
   * Where Square redirects the buyer after payment (no query string needed; orderId is appended server-side).
   * In development, defaults to http://localhost:5174/checkout/success when omitted.
   */
  CHECKOUT_SUCCESS_REDIRECT_URL:
    process.env.CHECKOUT_SUCCESS_REDIRECT_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5174/checkout/success'),
}

