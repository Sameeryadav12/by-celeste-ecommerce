import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { Card } from '../../../components/ui/Card'
import { SmartImage } from '../../../components/media/SmartImage'
import type { CatalogProduct } from '../../../features/catalog/catalogTypes'
import {
  effectiveWholesaleUnit,
  isApprovedWholesaleUser,
  normalizeWholesaleCatalogProduct,
} from '../../../features/wholesale/wholesalePricing'
import { WholesaleUnitPrice } from '../../../features/wholesale/components/WholesaleUnitPrice'
import { AddToCartButton } from '../../../features/cart/components/AddToCartButton'
import { QuantityControl } from '../../../features/cart/components/QuantityControl'
import { ProductCardDescription } from '../../../features/catalog/components/ProductCardDescription'

function clampInt(value: number, min: number, max: number) {
  const next = Math.floor(value)
  if (!Number.isFinite(next)) return min
  if (next < min) return min
  if (next > max) return max
  return next
}

export function WholesaleProductCard({ product: raw }: { product: CatalogProduct }) {
  const { user } = useAuth()
  const approved = isApprovedWholesaleUser(user)
  const product = normalizeWholesaleCatalogProduct(raw, approved)
  const maxQty = Math.max(1, product.stockQuantity || 1)
  const [quantity, setQuantity] = useState(1)

  const stockLabel = useMemo(() => {
    if (product.stockQuantity <= 0) return 'Out of stock'
    if (product.stockQuantity <= 10) return `Low stock (${product.stockQuantity})`
    return `In stock (${product.stockQuantity})`
  }, [product.stockQuantity])

  return (
    <Card className="group flex h-full flex-col overflow-hidden transform-gpu transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Link
          to={`/shop/${product.slug}`}
          className="relative block cursor-pointer overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200/60 transition-opacity hover:opacity-95"
        >
          <SmartImage
            src={product.imageUrl}
            alt={product.name}
            wrapperClassName="relative aspect-square w-full overflow-hidden"
            imgClassName="transform-gpu transition-transform duration-200 ease-in-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        <div className="min-h-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              <Link
                to={`/shop/${product.slug}`}
                className="cursor-pointer transition-colors hover:text-neutral-600 hover:underline hover:underline-offset-2"
              >
                {product.name}
              </Link>
            </h2>
            <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
              {stockLabel}
            </span>
          </div>
          <ProductCardDescription text={product.shortDescription} />
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <WholesaleUnitPrice product={product} approved={approved} />
            <Link
              to={`/shop/${product.slug}`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
            >
              View
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Qty
              </span>
              <QuantityControl
                quantity={quantity}
                min={1}
                max={maxQty}
                onDecrease={() => setQuantity((q) => clampInt(q - 1, 1, maxQty))}
                onIncrease={() => setQuantity((q) => clampInt(q + 1, 1, maxQty))}
                onSet={(v) => setQuantity(clampInt(v, 1, maxQty))}
              />
            </div>
          </div>

          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              price: effectiveWholesaleUnit(product, approved),
              compareAtPrice: product.compareAtPrice,
              stockQuantity: product.stockQuantity,
              categoryName: product.categories[0]?.name,
              shortDescription: product.shortDescription,
              pricingMode: approved ? 'wholesale' : undefined,
            }}
            quantity={quantity}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  )
}

