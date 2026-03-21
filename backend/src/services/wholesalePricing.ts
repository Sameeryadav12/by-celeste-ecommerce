import type { Prisma, Role, WholesaleApprovalStatus } from '@prisma/client'

/** Who is asking for catalog/checkout prices (from DB, not JWT claims). */
export type PricingViewer = {
  role: Role
  wholesaleApprovalStatus: WholesaleApprovalStatus
} | null

export function receivesApprovedWholesalePricing(viewer: PricingViewer): boolean {
  return viewer?.role === 'WHOLESALE' && viewer.wholesaleApprovalStatus === 'APPROVED'
}

type ProductPriceRow = {
  price: Prisma.Decimal
  wholesalePrice: Prisma.Decimal | null
}

/**
 * Unit price the customer pays: approved wholesale + set wholesalePrice → wholesale; else retail `price`.
 */
export function effectiveProductUnitPrice(product: ProductPriceRow, viewer: PricingViewer): Prisma.Decimal {
  if (receivesApprovedWholesalePricing(viewer) && product.wholesalePrice != null) {
    return product.wholesalePrice
  }
  return product.price
}

export function isShowingWholesaleUnitPrice(product: ProductPriceRow, viewer: PricingViewer): boolean {
  return receivesApprovedWholesalePricing(viewer) && product.wholesalePrice != null
}
