import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import { adminDownloadProductsCsv } from '../controllers/admin.catalog.controller'
import { adminDownloadOrdersCsv } from '../controllers/admin.orders.controller'
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
import { adminCustomersRouter } from '../routes/admin.customers.routes'
import { checkoutRouter } from '../routes/checkout.routes'
import { orderPublicRouter } from '../routes/order.public.routes'
import { squareWebhookRouter } from '../routes/square.webhook.routes'
import { accountCustomerRouter } from '../routes/account.customer.routes'
import { testimonialsRouter } from '../routes/testimonials.routes'
import { adminTestimonialsRouter } from '../routes/admin.testimonials.routes'
import { contentPublicRouter } from '../routes/content.public.routes'
import { adminContentRouter } from '../routes/admin.content.routes'
import { adminSecurityRouter } from '../routes/admin.security.routes'
import { adminUploadRouter } from '../routes/admin.upload.routes'
import { adminDiscountsRouter } from '../routes/admin.discounts.routes'
import { discountsPublicRouter } from '../routes/discounts.public.routes'
import {
  adminEventImageUpload,
  adminProductImageUpload,
  completeAdminEventImageUpload,
  completeAdminProductImageUpload,
} from '../controllers/admin.upload.controller'
import {
  EVENT_UPLOADS_DIR,
  PRODUCT_UPLOADS_DIR,
  ensureEventUploadsDir,
  ensureProductUploadsDir,
} from '../config/uploads'
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
      exposedHeaders: ['Content-Disposition', 'Content-Type'],
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

  ensureProductUploadsDir()
  ensureEventUploadsDir()
  app.use(
    '/uploads/products',
    express.static(path.resolve(PRODUCT_UPLOADS_DIR), {
      fallthrough: false,
      maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
    }),
  )
  app.use(
    '/uploads/events',
    express.static(path.resolve(EVENT_UPLOADS_DIR), {
      fallthrough: false,
      maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
    }),
  )

  app.use(healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/products', productPublicRouter)
  app.use('/api/categories', categoryPublicRouter)
  app.use('/api/ingredients', ingredientPublicRouter)
  app.use('/api/events', eventsPublicRouter)
  app.use('/api/testimonials', testimonialsRouter)
  app.use('/api/content', contentPublicRouter)
  app.use('/api/discounts', discountsPublicRouter)

  // Single /api/admin app � Express 5 can fail to fall through when multiple
  // `app.use('/api/admin', router)` stacks handle the same prefix.
  // CSV exports on the main app (stable path; no `.csv` extension routing issues).
  app.get(
    '/api/admin/exports/products',
    requireAuth,
    requireRole([Role.ADMIN]),
    adminDownloadProductsCsv,
  )
  app.get(
    '/api/admin/exports/orders',
    requireAuth,
    requireRole([Role.ADMIN]),
    adminDownloadOrdersCsv,
  )

  // Stable upload paths on the main app (Express 5 nested /api/admin router can 404).
  app.post(
    '/api/admin/uploads/product-image',
    requireAuth,
    requireRole([Role.ADMIN]),
    adminProductImageUpload,
    completeAdminProductImageUpload,
  )
  app.post(
    '/api/admin/uploads/event-image',
    requireAuth,
    requireRole([Role.ADMIN]),
    adminEventImageUpload,
    completeAdminEventImageUpload,
  )

  const adminApi = express.Router()
  adminApi.use('/uploads', adminUploadRouter)
  adminApi.use('/security', adminSecurityRouter)
  adminApi.use('/testimonials', adminTestimonialsRouter)
  adminApi.use('/content', adminContentRouter)
  adminApi.use('/events', adminEventsRouter)
  adminApi.use('/orders', adminOrdersRouter)
  adminApi.use('/customers', adminCustomersRouter)
  adminApi.use('/wholesale', adminWholesaleRouter)
  adminApi.use('/discounts', adminDiscountsRouter)
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

