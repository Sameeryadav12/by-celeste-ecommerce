import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Seo } from '../components/seo/Seo'
import { getCategories, getProducts } from '../features/catalog/catalogApi'
import { CatalogEmptyState } from '../features/catalog/components/CatalogEmptyState'
import { ProductCard } from '../features/catalog/components/ProductCard'
import { ProductCardSkeleton } from '../features/catalog/components/ProductCardSkeleton'
import type { CatalogCategory, CatalogProductsResult, ProductSort } from '../features/catalog/catalogTypes'
import { Reveal } from '../components/animation/Reveal'

const PAGE_SIZE = 9

const SORT_OPTIONS: Array<{ label: string; value: ProductSort }> = [
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Price (low to high)', value: 'price_asc' },
  { label: 'Price (high to low)', value: 'price_desc' },
]

const DEFAULT_SORT: ProductSort = 'name_asc'

const fieldClass =
  'h-9 w-full rounded-lg border border-neutral-200/90 bg-white px-3 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200/80'

function SearchSubmitIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export function ShopPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [catalog, setCatalog] = useState<CatalogProductsResult | null>(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedCategory = searchParams.get('category') ?? ''
  const selectedSort = (searchParams.get('sort') as ProductSort | null) ?? DEFAULT_SORT
  const featuredOnly = searchParams.get('featured') === 'true'
  const currentPage = parsePositiveInt(searchParams.get('page'), 1)
  const search = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    setCategoriesLoading(true)
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {
        setCategories([])
      })
      .finally(() => {
        setCategoriesLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setProductsLoading(true)
    setError(null)

    getProducts(
      {
        page: currentPage,
        limit: PAGE_SIZE,
        category: selectedCategory || undefined,
        featured: featuredOnly || undefined,
        search: search || undefined,
        sort: selectedSort,
      },
      controller.signal,
    )
      .then((data) => {
        setCatalog(data)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Could not load products right now.')
      })
      .finally(() => {
        setProductsLoading(false)
      })

    return () => controller.abort()
  }, [
    currentPage,
    featuredOnly,
    search,
    selectedCategory,
    selectedSort,
    user?.id,
    user?.wholesaleApprovalStatus,
  ])

  const totalPages = catalog?.pagination.totalPages ?? 1
  const products = catalog?.products ?? []

  const activeCategoryName = useMemo(() => {
    if (!selectedCategory) return 'All categories'
    const found = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)
    return found?.name ?? 'Selected category'
  }, [categories, selectedCategory])

  function updateFilters(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams)

    Object.entries(next).forEach(([key, value]) => {
      if (value == null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    if (Object.keys(next).some((k) => k !== 'page')) {
      params.set('page', '1')
    }

    setSearchParams(params)
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    updateFilters({ search: searchInput.trim() || null })
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(selectedCategory) ||
    featuredOnly ||
    selectedSort !== DEFAULT_SORT

  function clearFilters() {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  return (
    <>
      <Seo
        title="Shop skincare products | By Celeste"
        description="Browse By Celeste skincare products. Search by name, filter by category, and view featured favourites."
      />
      <section className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Shop
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
            Discover By Celeste essentials—small-batch formulas with Australian botanicals. Browse by
            category, search by name, or focus on featured products. Native highlights appear subtly on
            cards where they match the formula.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3 shadow-sm sm:p-3.5">
          {/* Row 1: search + category + sort — one toolbar */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
            <form
              onSubmit={submitSearch}
              className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm"
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                type="search"
                placeholder="Search products"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0"
                aria-label="Search products by name"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center border-l border-neutral-200/80 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                aria-label="Search"
              >
                <SearchSubmitIcon className="h-4 w-4" />
              </button>
            </form>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:min-w-0 md:flex-none md:flex-row md:gap-2">
              <select
                value={selectedCategory}
                onChange={(event) => updateFilters({ category: event.target.value || null })}
                className={`${fieldClass} md:w-[min(100%,11rem)] lg:w-44`}
                disabled={categoriesLoading}
                aria-label="Category"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSort}
                onChange={(event) => updateFilters({ sort: event.target.value })}
                className={`${fieldClass} md:w-[min(100%,11rem)] lg:w-48`}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: featured chip + results + clear */}
          <div className="mt-2.5 flex flex-col gap-2 border-t border-neutral-200/60 pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={featuredOnly}
                onClick={() => updateFilters({ featured: featuredOnly ? null : 'true' })}
                className={[
                  'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition',
                  featuredOnly
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200/90 bg-white text-neutral-600 shadow-sm hover:border-neutral-300 hover:text-neutral-900',
                ].join(' ')}
              >
                Featured only
              </button>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs sm:justify-end">
              <p className="tabular-nums text-neutral-500">
                {productsLoading ? (
                  <span className="text-neutral-400">Loading…</span>
                ) : (
                  <>
                    <span className="font-medium text-neutral-800">
                      {catalog?.pagination.total ?? 0}
                    </span>
                    <span className="text-neutral-400"> · </span>
                    <span>{activeCategoryName}</span>
                  </>
                )}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-900 hover:decoration-neutral-500"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {productsLoading ? (
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </Reveal>
      ) : products.length === 0 ? (
        <CatalogEmptyState message="No products matched your filters. Try another category or search term." />
      ) : (
        <>
          <Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>

          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="text-neutral-700">
              Page {catalog?.pagination.page ?? 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => updateFilters({ page: String(Math.max(1, currentPage - 1)) })}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => updateFilters({ page: String(Math.min(totalPages, currentPage + 1)) })}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      </section>
    </>
  )
}

