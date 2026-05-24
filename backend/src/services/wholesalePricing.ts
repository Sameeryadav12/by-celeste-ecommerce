import { Prisma, type Role, type WholesaleApprovalStatus } from '@prisma/client'

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

/** Approved wholesale buyers pay 50% of retail (catalog `price`). */
const WHOLESALE_DISCOUNT_FACTOR = new Prisma.Decimal('0.5')

/**
 * Unit price the customer pays: approved wholesale → 50% of retail; else retail `price`.
 */
export function effectiveProductUnitPrice(product: ProductPriceRow, viewer: PricingViewer): Prisma.Decimal {
  if (receivesApprovedWholesalePricing(viewer)) {
    if (product.wholesalePrice != null) return product.wholesalePrice
    return product.price.mul(WHOLESALE_DISCOUNT_FACTOR)
  }
  return product.price
}

export function wholesaleUnitPriceFromRetail(retail: Prisma.Decimal): Prisma.Decimal {
  return retail.mul(WHOLESALE_DISCOUNT_FACTOR)
}

export function isShowingWholesaleUnitPrice(_product: ProductPriceRow, viewer: PricingViewer): boolean {
  return receivesApprovedWholesalePricing(viewer)
}
