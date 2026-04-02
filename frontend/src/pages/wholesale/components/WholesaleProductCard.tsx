import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Card } from '../../../components/ui/Card'
import { SmartImage } from '../../../components/media/SmartImage'
import type { CatalogProduct } from '../../../features/catalog/catalogTypes'
import { ProductPrice } from '../../../features/catalog/components/ProductPrice'
import { AddToCartButton } from '../../../features/cart/components/AddToCartButton'
import { QuantityControl } from '../../../features/cart/components/QuantityControl'

function clampInt(value: number, min: number, max: number) {
  const next = Math.floor(value)
  if (!Number.isFinite(next)) return min
  if (next < min) return min
  if (next > max) return max
  return next
}

export function WholesaleProductCard({ product }: { product: CatalogProduct }) {
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
        <div className="relative overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200/60">
          <SmartImage
            src={product.imageUrl}
            alt={product.name}
            wrapperClassName="relative aspect-square w-full overflow-hidden"
            imgClassName="transform-gpu transition-transform duration-200 ease-in-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-neutral-900">{product.name}</h2>
            <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
              {stockLabel}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              retailUnitPrice={product.retailUnitPrice}
              isWholesalePrice={product.isWholesalePrice}
            />
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
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              stockQuantity: product.stockQuantity,
              categoryName: product.categories[0]?.name,
              shortDescription: product.shortDescription,
            }}
            quantity={quantity}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  )
}

