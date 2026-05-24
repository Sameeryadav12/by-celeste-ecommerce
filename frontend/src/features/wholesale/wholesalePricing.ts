import type { CatalogProduct } from '../catalog/catalogTypes'

export type WholesalePricingUser = {
  role: string
  wholesaleApprovalStatus: string
} | null | undefined

export function isApprovedWholesaleUser(user: WholesalePricingUser): boolean {
  return user?.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'APPROVED'
}

function roundAud(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** DB retail unit (catalog `price` column). */
export function resolveRetailUnit(product: CatalogProduct): number {
  if (product.retailUnitPrice != null && Number.isFinite(product.retailUnitPrice)) {
    return product.retailUnitPrice
  }
  return product.price
}

/**
 * effectiveWholesale = catalogWholesalePrice ?? retail * 0.5
 * When API already applied wholesale, `price` is the effective unit.
 */
export function effectiveWholesaleUnit(product: CatalogProduct, approved: boolean): number {
  if (!approved) return product.price

  const retail = resolveRetailUnit(product)

  if (product.catalogWholesalePrice != null && Number.isFinite(product.catalogWholesalePrice)) {
    return product.catalogWholesalePrice
  }

  if (product.isWholesalePrice && product.retailUnitPrice != null) {
    return product.price
  }

  return roundAud(retail * 0.5)
}

export function normalizeWholesaleCatalogProduct(
  product: CatalogProduct,
  approved: boolean,
): CatalogProduct {
  if (!approved) return product

  const retail = resolveRetailUnit(product)
  const wholesale = effectiveWholesaleUnit(product, true)

  return {
    ...product,
    price: wholesale,
    retailUnitPrice: retail,
    isWholesalePrice: true,
  }
}

export function wholesaleUnitPrice(product: CatalogProduct, approved: boolean): number {
  return effectiveWholesaleUnit(product, approved)
}

export function retailUnitPrice(product: CatalogProduct, approved: boolean): number {
  if (!approved) return product.price
  return resolveRetailUnit(product)
}
