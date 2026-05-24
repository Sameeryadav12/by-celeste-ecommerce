import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {
  EVENT_UPLOADS_DIR,
  PRODUCT_IMAGE_MAX_WIDTH,
  PRODUCT_IMAGE_WEBP_QUALITY,
  ensureEventUploadsDir,
} from '../config/uploads'

export const UPLOADED_EVENT_IMAGE_PREFIX = '/uploads/events/'

export function isManagedEventUploadUrl(imageUrl: string): boolean {
  const trimmed = imageUrl.trim()
  if (!trimmed.startsWith(UPLOADED_EVENT_IMAGE_PREFIX)) return false
  const rest = trimmed.slice(UPLOADED_EVENT_IMAGE_PREFIX.length)
  if (!rest || rest.includes('..') || rest.includes('\\') || rest.includes('/')) return false
  return true
}

function localPathForManagedUpload(imageUrl: string): string | null {
  if (!isManagedEventUploadUrl(imageUrl)) return null
  const filename = path.basename(imageUrl.trim())
  return path.join(EVENT_UPLOADS_DIR, filename)
}

export async function deleteManagedEventUpload(imageUrl: string): Promise<void> {
  const filePath = localPathForManagedUpload(imageUrl)
  if (!filePath) return
  try {
    await fs.unlink(filePath)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') throw err
  }
}

export async function processAndSaveEventImage(
  input: Buffer,
): Promise<{ filename: string; imageUrl: string }> {
  ensureEventUploadsDir()
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`
  const outPath = path.join(EVENT_UPLOADS_DIR, filename)

  await sharp(input)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_WEBP_QUALITY })
    .toFile(outPath)

  return { filename, imageUrl: `${UPLOADED_EVENT_IMAGE_PREFIX}${filename}` }
}
