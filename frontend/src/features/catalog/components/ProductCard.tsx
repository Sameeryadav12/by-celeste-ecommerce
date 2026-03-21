import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import type { CatalogProduct } from '../catalogTypes'
import { productNativeBadges } from '../nativeIngredientHighlights'
import { ProductPrice } from './ProductPrice'
import { AddToCartButton } from '../../cart/components/AddToCartButton'
import { SmartImage } from '../../../components/media/SmartImage'

export function ProductCard({ product }: { product: CatalogProduct }) {
  const nativeBadges = productNativeBadges(product, 2)

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="relative overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200/60">
          <SmartImage
            src={product.imageUrl}
            alt={product.name}
            wrapperClassName="relative aspect-square w-full overflow-hidden"
            loading="lazy"
          />
          {product.isFeatured ? (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-900">
              Featured
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold text-neutral-900">{product.name}</h2>
          {nativeBadges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {nativeBadges.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700">{product.shortDescription}</p>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-neutral-100 pt-4">
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
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              stockQuantity: product.stockQuantity,
            }}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  )
}
