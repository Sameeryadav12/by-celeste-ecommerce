import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Seo } from '../../components/seo/Seo'
import { getProducts } from '../../features/catalog/catalogApi'
import type { CatalogProduct } from '../../features/catalog/catalogTypes'
import { CatalogEmptyState } from '../../features/catalog/components/CatalogEmptyState'
import { ProductCardSkeleton } from '../../features/catalog/components/ProductCardSkeleton'
import { WholesaleProductCard } from './components/WholesaleProductCard'
import { Reveal } from '../../components/animation/Reveal'

const PAGE_SIZE = 18

export function WholesaleShopPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getProducts({ page: 1, limit: PAGE_SIZE, sort: 'name_asc' }, controller.signal)
      .then((result) => setProducts(result.products))
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Could not load products right now.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [fetchKey])

  return (
    <>
      <Seo
        title="Wholesale Shop | By Celeste"
        description="Browse By Celeste products with approved wholesale pricing."
      />

      <section className="space-y-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Wholesale Dashboard
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Wholesale Shop</h1>
          <p className="max-w-2xl text-sm leading-snug text-neutral-700">
            Browse products with wholesale pricing. Your cart will use wholesale prices while you’re
            signed in and approved.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/70 px-3 py-2.5 text-sm text-emerald-950">
          <span className="font-medium">Wholesale Pricing Active</span>
          <span className="text-emerald-900/80">
            {' '}
            – prices shown below reflect your approved wholesale account.
          </span>
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0">{error}</p>
            <Button
              type="button"
              variant="primary"
              className="shrink-0 sm:scale-100"
              onClick={() => {
                setError(null)
                setFetchKey((k) => k + 1)
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {loading ? (
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </Reveal>
        ) : products.length === 0 ? (
          <CatalogEmptyState
            message="No products are available right now."
            actions={
              <Link
                to="/wholesale/support"
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Contact support
              </Link>
            }
          />
        ) : (
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <WholesaleProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
        )}
      </section>
    </>
  )
}

