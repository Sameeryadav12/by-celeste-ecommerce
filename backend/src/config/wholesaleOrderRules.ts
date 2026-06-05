import { Prisma } from '@prisma/client'
import { ApiError } from '../utils/apiError'
import type { PricingViewer } from '../services/wholesalePricing'
import { receivesApprovedWholesalePricing } from '../services/wholesalePricing'

export const WHOLESALE_MINIMUM_ORDER_AUD = 300

export const WHOLESALE_MINIMUM_ORDER_MESSAGE =
  'Wholesale orders must be at least $300 before shipping.'

const WHOLESALE_MINIMUM_DECIMAL = new Prisma.Decimal(WHOLESALE_MINIMUM_ORDER_AUD)

export function isWholesaleMinimumMet(productSubtotal: Prisma.Decimal): boolean {
  return productSubtotal.gte(WHOLESALE_MINIMUM_DECIMAL)
}

/** Enforces minimum on pre-discount, pre-shipping product subtotal for approved wholesale buyers. */
export function assertWholesaleMinimumOrder(
  viewer: PricingViewer,
  productSubtotal: Prisma.Decimal,
): void {
  if (!receivesApprovedWholesalePricing(viewer)) return
  if (!isWholesaleMinimumMet(productSubtotal)) {
    throw new ApiError({
      statusCode: 400,
      code: 'WHOLESALE_MINIMUM_NOT_MET',
      message: WHOLESALE_MINIMUM_ORDER_MESSAGE,
    })
  }
}
