import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { resolveMediaUrl } from '../../lib/mediaUrl'
import {
  downloadAdminProductsCsv,
  listAllCategories,
  listAdminProducts,
  updateAdminProduct,
} from '../../features/admin/adminApi'
import { Button } from '../../components/ui/Button'
import { AdminTableSkeleton } from '../../features/admin/components/AdminTableSkeleton'
import { AdminStatusBadge } from './components/AdminStatusBadge'
import { adminWholesaleDisplay } from './components/adminProductPricing'

export function AdminProductsPage() {
  const location = useLocation()
  const [products, setProducts] = useState<Awaited<ReturnType<typeof listAdminProducts>>['products']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

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
    } catch {
      setError('Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, categoryFilter])

  async function handleToggleActive(productId: string, productName: string, current: boolean) {
    if (current) {
      const ok = window.confirm(
        `Hide "${productName}" from the shop?\n\nThe product stays in the database. Past orders keep their line-item history.`,
      )
      if (!ok) return
    }

    setActionLoadingId(productId)
    setError(null)
    setMessage(null)
    try {
      await updateAdminProduct(productId, { isActive: !current })
      setMessage(current ? 'Product hidden from storefront.' : 'Product visible on storefront.')
      await loadProducts()
    } catch {
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
      setMessage(current ? 'Removed from featured.' : 'Marked as featured.')
      await loadProducts()
    } catch {
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

  async function handleExportCsv() {
    setExportBusy(true)
    setExportError(null)
    try {
      await downloadAdminProductsCsv({
        search: search.trim() || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        activeOnly: statusFilter === 'all' ? false : statusFilter === 'active',
      })
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Could not export products.')
    } finally {
      setExportBusy(false)
    }
  }

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
        <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0">{error}</p>
          <Button type="button" variant="primary" className="shrink-0" onClick={() => void loadProducts()}>
            Retry
          </Button>
        </div>
      ) : null}

      {exportError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Product list</h2>
            <p className="text-sm text-slate-500">
              Hide products to remove them from the shop without deleting order history.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            loading={exportBusy}
            disabled={exportBusy}
            onClick={() => void handleExportCsv()}
          >
            Export CSV
          </Button>
        </div>
        <div className="mt-3 grid w-full gap-2 sm:grid-cols-3">
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
              <option value="inactive">Hidden only</option>
            </select>
        </div>

        {showingFilters ? <p className="mt-3 text-xs text-slate-500">Filters are applied to this list.</p> : null}

        {loading ? (
          <AdminTableSkeleton rows={8} columns={8} />
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
                {products.map((p) => {
                  const wholesale = adminWholesaleDisplay(p.price, p.wholesalePrice)
                  const busy = actionLoadingId === p.id
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveMediaUrl(p.imageUrl)}
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
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{wholesale.text}</span>
                        {wholesale.derived ? (
                          <span
                            className="ml-1 text-xs text-slate-500"
                            title="50% of retail (default wholesale rule)"
                          >
                            (50%)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{p.stockQuantity}</td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge status={p.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={p.isFeatured}
                            disabled={busy}
                            onChange={() => void handleToggleFeatured(p.id, p.isFeatured)}
                          />
                          Featured
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="text-xs font-medium text-slate-800 underline-offset-2 hover:underline"
                          >
                            Edit
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            className="!h-auto !min-h-0 !px-0 !py-0 text-xs font-medium text-slate-700 hover:bg-transparent hover:underline"
                            disabled={busy}
                            onClick={() => void handleToggleActive(p.id, p.name, p.isActive)}
                          >
                            {p.isActive ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
