import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Card } from '../components/ui/Card'
import { getProductBySlug } from '../features/catalog/catalogApi'
import { CatalogEmptyState } from '../features/catalog/components/CatalogEmptyState'
import { ProductPrice } from '../features/catalog/components/ProductPrice'
import type { CatalogProduct } from '../features/catalog/catalogTypes'
import { AddToCartButton } from '../features/cart/components/AddToCartButton'
import { Seo } from '../components/seo/Seo'
import { SmartImage } from '../components/media/SmartImage'
import { productNativeBadges } from '../features/catalog/nativeIngredientHighlights'
import { howToUseSteps } from '../features/catalog/productDetailFormat'

function productDescriptionParagraphs(description: string): string[] {
  const trimmed = description.trim()
  if (!trimmed) return []
  const blocks = trimmed
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
  return blocks.length > 0 ? blocks : [trimmed]
}

export function ProductDetailPage() {
  const { user } = useAuth()
  const { slug } = useParams<{ slug: string }>()

  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [notFound, setNotFound] = useState(!slug)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      return
    }

    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setNotFound(false)
    setError(null)

    getProductBySlug(slug, controller.signal)
      .then((data) => {
        setProduct(data)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Could not load product details.'
        if (message.toLowerCase().includes('not found')) {
          setNotFound(true)
          return
        }
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [slug, user?.id, user?.wholesaleApprovalStatus])

  if (notFound) {
    const title = 'Product not found | By Celeste'
    return (
      <section className="space-y-4">
        <Seo
          title={title}
          description="This product may be inactive or the link may be incorrect."
        />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Product not found</h1>
        <CatalogEmptyState message="We couldn't find that product. It may be inactive or the link may be incorrect." />
        <Link
          to="/shop"
          className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 hover:bg-neutral-100"
        >
          Back to Shop
        </Link>
      </section>
    )
  }

  if (loading) {
    const title = 'Product | By Celeste'
    return (
      <section className="space-y-8">
        <Seo title={title} description="Loading product details from By Celeste." />
        <div className="grid animate-pulse gap-6 md:grid-cols-2">
          <div className="aspect-square w-full rounded-2xl bg-neutral-200" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-5/6 rounded bg-neutral-200" />
            <div className="h-6 w-1/3 rounded bg-neutral-200" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !product) {
    const title = 'Unable to load product | By Celeste'
    return (
      <section className="space-y-4">
        <Seo title={title} description="Something went wrong while loading this product." />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Unable to load product</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Something went wrong while loading this product.'}
        </div>
      </section>
    )
  }

  const inStock = product.stockQuantity > 0
  const nativeBadgesTitle = productNativeBadges(product, 2)
  const nativeHighlightLabels = productNativeBadges(product, 6)
  const descriptionParagraphs = productDescriptionParagraphs(product.description)
  const useSteps = howToUseSteps(product.howToUse)

  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined
  const absoluteImageUrl =
    typeof window !== 'undefined'
      ? product.imageUrl.startsWith('/')
        ? `${window.location.origin}${product.imageUrl}`
        : product.imageUrl
      : undefined
  const jsonLd = url
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription,
        image: absoluteImageUrl,
        brand: {
          '@type': 'Brand',
          name: 'By Celeste',
        },
        category: product.categories.map((c) => c.name).join(', ') || undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'AUD',
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url,
        },
      }
    : undefined

  return (
    <>
      <Seo title={`${product.name} | By Celeste`} description={product.shortDescription} jsonLd={jsonLd} />
      <section className="space-y-10 sm:space-y-12">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/70">
            <SmartImage
              src={product.imageUrl}
              alt={product.name}
              wrapperClassName="relative aspect-square w-full overflow-hidden"
              loading="lazy"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            {product.isFeatured ? (
              <span className="inline-flex rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-white">
                Featured
              </span>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
            {nativeBadgesTitle.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {nativeBadgesTitle.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-base leading-relaxed text-neutral-500">{product.shortDescription}</p>
          </div>

          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            retailUnitPrice={product.retailUnitPrice}
            isWholesalePrice={product.isWholesalePrice}
          />

          <div
            className={[
              'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
              inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
            ].join(' ')}
          >
            {inStock ? `In stock (${product.stockQuantity})` : 'Currently out of stock'}
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
            className="w-full sm:w-auto"
          />

          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {descriptionParagraphs.length > 0 ? (
        <Card className="border-neutral-200/90 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Overview</h2>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {descriptionParagraphs.map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      ) : null}

      {product.benefits.length > 0 ? (
        <Card className="border-neutral-200/90 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Key benefits</h2>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 marker:text-neutral-300">
            {product.benefits.map((benefit, idx) => (
              <li key={`${benefit}-${idx}`} className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                {benefit}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {nativeHighlightLabels.length > 0 ? (
        <Card className="border-neutral-200/90 bg-neutral-50/60 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
            Featuring Australian natives
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            This formula highlights native botanicals you&apos;ll also see across our range.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nativeHighlightLabels.map((label) => (
              <span
                key={label}
                className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700"
              >
                {label}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="border-neutral-200/90 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Ingredients</h2>
        {product.ingredients.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">Ingredient details will be added soon.</p>
        ) : (
          <ul className="mt-5 divide-y divide-neutral-100">
            {product.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="py-4 first:pt-0">
                <p className="text-sm font-semibold text-neutral-900">{ingredient.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{ingredient.description}</p>
                {ingredient.benefits ? (
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400">{ingredient.benefits}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border-neutral-200/90 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">How to use</h2>
        {useSteps.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Usage instructions will be added soon.</p>
        ) : useSteps.length === 1 ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{useSteps[0]}</p>
        ) : (
          <ol className="mt-4 list-decimal space-y-3 pl-5 marker:font-medium marker:text-neutral-400">
            {useSteps.map((step, idx) => (
              <li key={`step-${idx}`} className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                {step}
              </li>
            ))}
          </ol>
        )}
      </Card>
      </section>
    </>
  )
}

