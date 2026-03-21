import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { verifyAccessToken } from '../utils/tokens'

/**
 * Sets `req.catalogPricingViewer` for public product routes (guest → null).
 * Does not require auth; invalid/expired tokens are ignored (guest pricing).
 */
export async function loadCatalogPricingViewer(req: Request, _res: Response, next: NextFunction) {
  req.catalogPricingViewer = null
  const token = req.cookies?.[env.AUTH_COOKIE_NAME]
  if (!token) {
    return next()
  }

  try {
    const payload = verifyAccessToken(token)
    const row = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, wholesaleApprovalStatus: true, isActive: true },
    })
    if (!row?.isActive) {
      return next()
    }
    req.catalogPricingViewer = {
      role: row.role,
      wholesaleApprovalStatus: row.wholesaleApprovalStatus,
    }
  } catch {
    // ignore invalid token
  }

  next()
}
