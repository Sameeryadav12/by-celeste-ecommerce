import multer from 'multer'
import {
  PRODUCT_IMAGE_ALLOWED_MIME,
  PRODUCT_IMAGE_MAX_BYTES,
  ensureProductUploadsDir,
} from '../config/uploads'

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'] as const

ensureProductUploadsDir()

export const productImageUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PRODUCT_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype.toLowerCase()
    if (!PRODUCT_IMAGE_ALLOWED_MIME.has(mime)) {
      cb(new Error('INVALID_IMAGE_TYPE'))
      return
    }
    const lower = file.originalname.toLowerCase()
    if (!ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
      cb(new Error('INVALID_IMAGE_TYPE'))
      return
    }
    cb(null, true)
  },
}).single('image')
