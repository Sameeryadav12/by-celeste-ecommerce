import fs from 'node:fs'
import path from 'node:path'

export const PRODUCT_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'products')

export const EVENT_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'events')

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const PRODUCT_IMAGE_MAX_WIDTH = 1200

export const PRODUCT_IMAGE_WEBP_QUALITY = 82

export const PRODUCT_IMAGE_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function ensureProductUploadsDir() {
  fs.mkdirSync(PRODUCT_UPLOADS_DIR, { recursive: true })
}

export function ensureEventUploadsDir() {
  fs.mkdirSync(EVENT_UPLOADS_DIR, { recursive: true })
}
