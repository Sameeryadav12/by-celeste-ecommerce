import express from 'express'
import cors from 'cors'
import { healthRouter } from '../routes/health.routes'
import cookieParser from 'cookie-parser'
import { authRouter } from '../routes/auth.routes'
import { productPublicRouter } from '../routes/product.public.routes'
import { categoryPublicRouter } from '../routes/category.public.routes'
import { ingredientPublicRouter } from '../routes/ingredient.public.routes'
import { eventsPublicRouter } from '../routes/events.public.routes'
import { adminCatalogRouter } from '../routes/admin.catalog.routes'
import { adminEventsRouter } from '../routes/admin.events.routes'
import { adminSummaryRouter } from '../routes/admin.summary.routes'
import { adminOrdersRouter } from '../routes/admin.orders.routes'
import { adminWholesaleRouter } from '../routes/admin.wholesale.routes'
import { checkoutRouter } from '../routes/checkout.routes'
import { orderPublicRouter } from '../routes/order.public.routes'
import { squareWebhookRouter } from '../routes/square.webhook.routes'
import { accountCustomerRouter } from '../routes/account.customer.routes'
import { testimonialsRouter } from '../routes/testimonials.routes'
import { adminTestimonialsRouter } from '../routes/admin.testimonials.routes'
import { contentPublicRouter } from '../routes/content.public.routes'
import { adminContentRouter } from '../routes/admin.content.routes'
import { notFoundHandler } from '../middleware/notFoundHandler'
import { errorHandler } from '../middleware/errorHandler'
import { env } from '../config/env'

export function createApp() {
  const app = express()

  if (env.NODE_ENV === 'production' && !env.FRONTEND_ORIGIN) {
    // eslint-disable-next-line no-console
    console.warn(
      '[by-celeste] FRONTEND_ORIGIN is unset � falling back to reflective CORS for browser requests. Set FRONTEND_ORIGIN to lock this down.',
    )
  }

  app.use(
    cors({
      // If FRONTEND_ORIGIN is missing, reflect request origins so storefront still works.
      // Keep credentials enabled for auth cookie flows.
      origin: env.FRONTEND_ORIGIN ?? true,
      credentials: true,
    }),
  )

  // Square webhooks: must use raw body for HMAC verification (before express.json).
  // Match JSON even if Square sends `application/json; charset=utf-8`.
  app.use(
    '/api/webhooks/square',
    express.raw({
      type: (req) => (req.headers['content-type'] ?? '').toLowerCase().includes('application/json'),
    }),
    squareWebhookRouter,
  )

  app.use(express.json())
  app.use(cookieParser())

  app.use(healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/products', productPublicRouter)
  app.use('/api/categories', categoryPublicRouter)
  app.use('/api/ingredients', ingredientPublicRouter)
  app.use('/api/events', eventsPublicRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/content', contentPublicRouter)

  // Single /api/admin app � Express 5 can fail to fall through when multiple
  // `app.use('/api/admin', router)` stacks handle the same prefix.
  const adminApi = express.Router()
  adminApi.use('/testimonials', adminTestimonialsRouter)
  adminApi.use('/content', adminContentRouter)
  adminApi.use('/events', adminEventsRouter)
  adminApi.use('/orders', adminOrdersRouter)
  adminApi.use('/wholesale', adminWholesaleRouter)
  adminApi.use(adminCatalogRouter)
  adminApi.use(adminSummaryRouter)
  app.use('/api/admin', adminApi)
  app.use('/api/checkout', checkoutRouter)
  app.use('/api/orders', orderPublicRouter)
  app.use('/api/account', accountCustomerRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
