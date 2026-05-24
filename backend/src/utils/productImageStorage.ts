import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {
  PRODUCT_IMAGE_MAX_WIDTH,
  PRODUCT_IMAGE_WEBP_QUALITY,
  PRODUCT_UPLOADS_DIR,
  ensureProductUploadsDir,
} from '../config/uploads'

export const UPLOADED_PRODUCT_IMAGE_PREFIX = '/uploads/products/'

export function isManagedProductUploadUrl(imageUrl: string): boolean {
  const trimmed = imageUrl.trim()
  if (!trimmed.startsWith(UPLOADED_PRODUCT_IMAGE_PREFIX)) return false
  const rest = trimmed.slice(UPLOADED_PRODUCT_IMAGE_PREFIX.length)
  if (!rest || rest.includes('..') || rest.includes('\\') || rest.includes('/')) return false
  return true
}

function localPathForManagedUpload(imageUrl: string): string | null {
  if (!isManagedProductUploadUrl(imageUrl)) return null
  const filename = path.basename(imageUrl.trim())
  return path.join(PRODUCT_UPLOADS_DIR, filename)
}

export async function deleteManagedProductUpload(imageUrl: string): Promise<void> {
  const filePath = localPathForManagedUpload(imageUrl)
  if (!filePath) return
  try {
    await fs.unlink(filePath)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') throw err
  }
}

export async function processAndSaveProductImage(
  input: Buffer,
): Promise<{ filename: string; imageUrl: string }> {
  ensureProductUploadsDir()
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`
  const outPath = path.join(PRODUCT_UPLOADS_DIR, filename)

  await sharp(input)
    .rotate()
    .resize({
      width: PRODUCT_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: PRODUCT_IMAGE_WEBP_QUALITY })
    .toFile(outPath)

  return { filename, imageUrl: `${UPLOADED_PRODUCT_IMAGE_PREFIX}${filename}` }
}

export async function replaceManagedProductImageIfNeeded(
  previousImageUrl: string | null | undefined,
  nextImageUrl: string,
): Promise<void> {
  const prev = previousImageUrl?.trim() ?? ''
  const next = nextImageUrl.trim()
  if (!prev || prev === next) return
  await deleteManagedProductUpload(prev)
}
