import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/apiError'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const fallback = {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong. Please try again.',
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    })
    return
  }

  res.status(fallback.statusCode).json({
    success: false,
    error: {
      code: fallback.code,
      message: fallback.message,
    },
  })
}

