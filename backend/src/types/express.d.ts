import type { Role, User, WholesaleApprovalStatus } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'role'>
      /** Set by `loadCatalogPricingViewer` on public catalog routes (from DB). */
      catalogPricingViewer?: { role: Role; wholesaleApprovalStatus: WholesaleApprovalStatus } | null
    }
  }
}

export {}

