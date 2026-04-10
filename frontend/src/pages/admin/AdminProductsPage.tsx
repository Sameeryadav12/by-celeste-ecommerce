import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import {
  listAllCategories,
  listAdminProducts,
  updateAdminProduct,
} from '../../features/admin/adminApi'
import { Button } from '../../components/ui/Button'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminProductsPage() {
  const location = useLocation()
  const [products, setProducts] = useState<Awaited<ReturnType<typeof listAdminProducts>>['products']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: string; name: string; isActive: boolean }>>([])

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      const cats = await listAllCategories(true)
      if (cancelled) return
      setCategoryOptions(cats)
    }
    void loadCategories().catch(() => {
      if (!cancelled) setError('Could not load category list.')
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError(null)
    try {
      const res = await listAdminProducts({
        page: 1,
        limit: 50,
        search: search.trim() || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        activeOnly: statusFilter === 'all' ? false : statusFilter === 'active',
      })
      setProducts(res.products)
    } catch (e) {
      setError('Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, categoryFilter])

  async function handleToggleActive(productId: string, current: boolean) {
    setActionLoadingId(productId)
    setError(null)
    setMessage(null)
    try {
      await updateAdminProduct(productId, { isActive: !current })
      setMessage(current ? 'Product hidden from storefront.' : 'Product made visible on storefront.')
      await loadProducts()
    } catch (e) {
      setError('Could not update product visibility. Please try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleToggleFeatured(productId: string, current: boolean) {
    setActionLoadingId(productId)
    setError(null)
    setMessage(null)
    try {
      await updateAdminProduct(productId, { isFeatured: !current })
      setMessage(current ? 'Product removed from featured list.' : 'Product added to featured list.')
      await loadProducts()
    } catch (e) {
      setError('Could not update featured status. Please try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const flash = typeof (location.state as { flash?: string } | null)?.flash === 'string'
    ? (location.state as { flash?: string }).flash
    : null

  const showingFilters = useMemo(() => {
    return search.trim() || statusFilter !== 'all' || categoryFilter !== 'all'
  }, [search, statusFilter, categoryFilter])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage your catalogue, pricing, stock, and storefront visibility.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add new product
        </Link>
      </div>

      {flash ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {flash}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Product list</h2>
            <p className="text-sm text-slate-500">Search and filter products, then edit or manage visibility.</p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-64"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        {showingFilters ? (
          <p className="mt-3 text-xs text-slate-500">Filters are applied to this list.</p>
        ) : null}

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-base font-medium text-slate-700">No products found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first product or adjust filters to see more results.
            </p>
            <Link
              to="/admin/products/new"
              className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add new product
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Retail</th>
                  <th className="px-4 py-3 font-medium">Wholesale</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{p.name}</p>
                          <p className="truncate text-xs text-slate-500">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {p.categories?.length
                        ? p.categories.slice(0, 2).map((c) => c.name).join(', ')
                        : 'Uncategorised'}
                      {p.categories && p.categories.length > 2 ? ' +more' : ''}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatAud(p.price)}</td>
                    <td className="px-4 py-3">{p.wholesalePrice ? formatAud(p.wholesalePrice) : '—'}</td>
                    <td className="px-4 py-3">{p.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={p.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={p.isFeatured ? 'FEATURED' : 'STANDARD'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-2.5 !py-1.5 text-xs"
                          disabled={actionLoadingId === p.id}
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                        >
                          {p.isActive ? 'Hide' : 'Activate'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-2.5 !py-1.5 text-xs"
                          disabled={actionLoadingId === p.id}
                          onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                        >
                          {p.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function formatAud(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n)
}

