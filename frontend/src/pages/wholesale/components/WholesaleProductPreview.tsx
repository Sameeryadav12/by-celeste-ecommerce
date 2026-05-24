import { resolveMediaUrl } from '../../../lib/mediaUrl'
import type { CatalogProduct } from '../../../features/catalog/catalogTypes'
import { WholesaleUnitPrice } from '../../../features/wholesale/components/WholesaleUnitPrice'

function previewImageSrc(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) return resolveMediaUrl(url)
  return url
}

export function WholesaleProductPreview({
  product,
  approved,
}: {
  product: CatalogProduct
  approved: boolean
}) {
  const stockLabel =
    product.stockQuantity <= 0
      ? 'Out of stock'
      : product.stockQuantity <= 10
        ? `Low stock (${product.stockQuantity})`
        : `In stock (${product.stockQuantity})`

  return (
    <div className="mt-3 flex max-w-md gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <img
          src={previewImageSrc(product.imageUrl)}
          alt=""
          width={80}
          height={80}
          className="block h-20 w-20 object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">{product.name}</p>
        <WholesaleUnitPrice product={product} approved={approved} compact />
        <p className="text-xs text-neutral-500">{stockLabel}</p>
      </div>
    </div>
  )
}
