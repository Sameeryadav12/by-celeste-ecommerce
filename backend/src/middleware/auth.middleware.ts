import type { NextFunction, Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { env } from '../config/env'
import { ApiError } from '../utils/apiError'
import { verifyAccessToken } from '../utils/tokens'

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.AUTH_COOKIE_NAME]
  if (!token) return next()

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    // Ignore invalid token for optional auth.
  }

  next()
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.AUTH_COOKIE_NAME]
  if (!token) {
    return next(
      new ApiError({
        statusCode: 401,
        code: 'UNAUTHENTICATED',
        message: 'You must be logged in to access this resource.',
      }),
    )
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch {
    return next(
      new ApiError({
        statusCode: 401,
        code: 'INVALID_SESSION',
        message: 'Your session is invalid or has expired. Please log in again.',
      }),
    )
  }
}

// Prepared for later use (e.g., admin-only routes)
export function requireRole(allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError({
          statusCode: 401,
          code: 'UNAUTHENTICATED',
          message: 'You must be logged in to access this resource.',
        }),
      )
    }

    if (!allowed.includes(req.user.role as Role)) {
      return next(
        new ApiError({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
        }),
      )
    }

    next()
  }
}

