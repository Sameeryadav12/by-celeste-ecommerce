import type { NextFunction, Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { eventImageUploadMiddleware } from '../middleware/eventImageUpload.middleware'
import { productImageUploadMiddleware } from '../middleware/productImageUpload.middleware'
import {
  deleteManagedEventUpload,
  processAndSaveEventImage,
} from '../utils/eventImageStorage'
import {
  deleteManagedProductUpload,
  processAndSaveProductImage,
} from '../utils/productImageStorage'

function handleImageUploadMiddlewareError(err: unknown, next: NextFunction) {
  if (err instanceof Error) {
    if (err.message === 'INVALID_IMAGE_TYPE') {
      next(
        new ApiError({
          statusCode: 400,
          code: 'INVALID_IMAGE_TYPE',
          message: 'Only JPG, PNG, or WebP images are allowed.',
        }),
      )
      return
    }
    const multerErr = err as Error & { code?: string }
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      next(
        new ApiError({
          statusCode: 400,
          code: 'FILE_TOO_LARGE',
          message: 'Image must be 5MB or smaller.',
        }),
      )
      return
    }
    if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      next(
        new ApiError({
          statusCode: 400,
          code: 'INVALID_UPLOAD_FIELD',
          message: 'Upload the image using the "image" field.',
        }),
      )
      return
    }
  }
  next(err)
}

export function adminProductImageUpload(req: Request, res: Response, next: NextFunction) {
  productImageUploadMiddleware(req, res, (err: unknown) => {
    if (err) {
      handleImageUploadMiddlewareError(err, next)
      return
    }
    next()
  })
}

export function adminEventImageUpload(req: Request, res: Response, next: NextFunction) {
  eventImageUploadMiddleware(req, res, (err: unknown) => {
    if (err) {
      handleImageUploadMiddlewareError(err, next)
      return
    }
    next()
  })
}

export const completeAdminProductImageUpload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file?.buffer?.length) {
    throw new ApiError({
      statusCode: 400,
      code: 'NO_FILE',
      message: 'Choose an image file to upload.',
    })
  }

  const replaceRaw = req.body?.replaceImageUrl
  if (typeof replaceRaw === 'string' && replaceRaw.trim()) {
    await deleteManagedProductUpload(replaceRaw)
  }

  const { imageUrl } = await processAndSaveProductImage(req.file.buffer)
  res.status(201).json({ success: true, data: { imageUrl } })
})

export const completeAdminEventImageUpload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file?.buffer?.length) {
    throw new ApiError({
      statusCode: 400,
      code: 'NO_FILE',
      message: 'Choose an image file to upload.',
    })
  }

  const replaceRaw = req.body?.replaceImageUrl
  if (typeof replaceRaw === 'string' && replaceRaw.trim()) {
    await deleteManagedEventUpload(replaceRaw)
  }

  const { imageUrl } = await processAndSaveEventImage(req.file.buffer)
  res.status(201).json({ success: true, data: { imageUrl } })
})
