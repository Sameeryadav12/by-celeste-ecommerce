import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../features/catalog/catalogApi'
import type { CatalogProduct } from '../../features/catalog/catalogTypes'
import { useCart } from '../../features/cart/CartContext'
import { formatAud } from '../../features/cart/money'
import { WS_PRIMARY, WS_SECONDARY, WS_SECONDARY_SM } from './wholesaleUi'

function BulkListEmptyIcon() {
  return (
    <svg
      className="mx-auto h-10 w-10 text-neutral-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

type BulkLine = {
  id: string
  product: CatalogProduct
  quantity: number
}

function newLineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function productToCartPayload(p: CatalogProduct) {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    stockQuantity: p.stockQuantity,
    categoryName: p.categories[0]?.name,
    shortDescription: p.shortDescription,
  }
}

async function fetchAllProducts(signal: AbortSignal): Promise<CatalogProduct[]> {
  const first = await getProducts({ page: 1, limit: 100, sort: 'name_asc' }, signal)
  const acc = [...first.products]
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const res = await getProducts({ page, limit: 100, sort: 'name_asc' }, signal)
    acc.push(...res.products)
  }
  return acc
}

function findProductByCsvName(products: CatalogProduct[], rawName: string): CatalogProduct | null {
  const name = rawName.trim()
  if (!name) return null
  const lower = name.toLowerCase()
  return products.find((p) => p.name.trim().toLowerCase() === lower) ?? null
}

function parseCsv(text: string): Array<{ productName: string; quantity: number; lineNo: number }> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return []
  let start = 0
  const h = lines[0].toLowerCase()
  if (h.startsWith('productname')) start = 1
  const rows: Array<{ productName: string; quantity: number; lineNo: number }> = []
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i]
    const comma = line.indexOf(',')
    if (comma < 0) {
      rows.push({ productName: '', quantity: NaN, lineNo: i + 1 })
      continue
    }
    const productName = line.slice(0, comma).replace(/^"|"$/g, '').trim()
    const qtyPart = line.slice(comma + 1).replace(/^"|"$/g, '').trim()
    const quantity = Number.parseInt(qtyPart, 10)
    rows.push({ productName, quantity, lineNo: i + 1 })
  }
  return rows
}

export function WholesaleBulkOrdersPage() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState('')
  const [qtyInput, setQtyInput] = useState('1')
  const [lines, setLines] = useState<BulkLine[]>([])

  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const [warningBanner, setWarningBanner] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setLoadingProducts(true)
    setProductsError(null)
    fetchAllProducts(ac.signal)
      .then(setProducts)
      .catch((e) => {
        if (e instanceof Error && e.name === 'AbortError') return
        setProductsError(e instanceof Error ? e.message : 'Could not load products.')
      })
      .finally(() => setLoadingProducts(false))
    return () => ac.abort()
  }, [])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const clearBanners = useCallback(() => {
    setErrorBanner(null)
    setWarningBanner(null)
    setSuccessBanner(null)
  }, [])

  const addLineFromForm = useCallback(() => {
    clearBanners()
    const p = productById.get(selectedId)
    if (!p) {
      setErrorBanner('Pick a product.')
      return
    }
    const qty = Number.parseInt(qtyInput, 10)
    if (!Number.isFinite(qty) || qty < 1) {
      setErrorBanner('Enter a quantity of at least 1.')
      return
    }
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === p.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }
        return next
      }
      return [...prev, { id: newLineId(), product: p, quantity: qty }]
    })
    setQtyInput('1')
  }, [clearBanners, productById, selectedId, qtyInput])

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const clearList = useCallback(() => {
    setLines([])
    clearBanners()
  }, [clearBanners])

  const handleCsv = useCallback(
    (file: File | null, inputEl: HTMLInputElement | null) => {
      clearBanners()
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const rows = parseCsv(text)
        if (rows.length === 0) {
          setErrorBanner('CSV has no data rows.')
          return
        }
        const rowErrors: string[] = []
        const additions: BulkLine[] = []
        for (const row of rows) {
          if (!row.productName.trim()) {
            rowErrors.push(`Line ${row.lineNo}: missing product name.`)
            continue
          }
          if (!Number.isFinite(row.quantity) || row.quantity < 1) {
            rowErrors.push(`Line ${row.lineNo}: invalid quantity for "${row.productName}".`)
            continue
          }
          const p = findProductByCsvName(products, row.productName)
          if (!p) {
            rowErrors.push(`Line ${row.lineNo}: no product match for "${row.productName}".`)
            continue
          }
          additions.push({ id: newLineId(), product: p, quantity: row.quantity })
        }
        if (additions.length === 0) {
          setErrorBanner(rowErrors.slice(0, 8).join(' ') || 'No valid rows in CSV.')
          return
        }
        setLines((prev) => {
          const next = [...prev]
          for (const add of additions) {
            const i = next.findIndex((l) => l.product.id === add.product.id)
            if (i >= 0) next[i] = { ...next[i], quantity: next[i].quantity + add.quantity }
            else next.push(add)
          }
          return next
        })
        if (rowErrors.length) {
          setWarningBanner(rowErrors.slice(0, 8).join(' '))
          window.setTimeout(() => setWarningBanner(null), 8000)
        }
        setSuccessBanner(`Imported ${additions.length} valid CSV row(s) into your list.`)
        window.setTimeout(() => setSuccessBanner(null), 5000)
      }
      reader.onerror = () => setErrorBanner('Failed to read file.')
      reader.readAsText(file)
      if (inputEl) inputEl.value = ''
    },
    [clearBanners, products],
  )

  const addAllToCart = useCallback(() => {
    clearBanners()
    if (lines.length === 0) {
      setErrorBanner('Add products to the list first.')
      return
    }
    const warnings: string[] = []
    const errors: string[] = []
    let added = 0
    for (const line of lines) {
      const p = line.product
      const cap = Math.max(0, p.stockQuantity)
      if (cap <= 0) {
        errors.push(`${p.name}: out of stock.`)
        continue
      }
      const q = Math.min(line.quantity, cap)
      if (q < line.quantity) {
        warnings.push(`${p.name}: list ${line.quantity} → cart ${q} (stock cap).`)
      }
      const payload = productToCartPayload(p)
      const { added: ok, message } = addItem({ ...payload, quantity: q })
      if (ok) added += 1
      else errors.push(`${p.name}: ${message}`)
    }
    if (added > 0) {
      setSuccessBanner(`Added ${added} line(s) to your cart. Open cart to review.`)
      setLines([])
      window.setTimeout(() => setSuccessBanner(null), 6000)
    }
    if (warnings.length) {
      setWarningBanner(warnings.slice(0, 8).join(' '))
      window.setTimeout(() => setWarningBanner(null), 10000)
    }
    if (errors.length) {
      setErrorBanner(errors.slice(0, 8).join(' '))
    }
  }, [addItem, clearBanners, lines])

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Wholesale Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">Bulk Orders</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">
          Order large quantities quickly using bulk tools
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-600">
          Build a list below, then use Add all to cart. Each line is capped at live stock the same way as
          the rest of checkout.
        </p>
      </div>

      {successBanner ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successBanner}
        </div>
      ) : null}
      {warningBanner ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {warningBanner}
        </div>
      ) : null}
      {errorBanner ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorBanner}
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Add products</h2>
        {loadingProducts ? (
          <p className="mt-3 text-sm text-neutral-600">Loading catalog…</p>
        ) : productsError ? (
          <p className="mt-3 text-sm text-red-700">{productsError}</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="block min-w-[200px] flex-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Product</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-full max-w-[160px] text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Quantity</span>
              <input
                type="number"
                min={1}
                step={1}
                value={qtyInput}
                onChange={(e) => setQtyInput(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 tabular-nums"
              />
            </label>
            <button type="button" onClick={addLineFromForm} className={WS_PRIMARY}>
              Add
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">CSV import</h2>
        <p className="mt-1 text-xs text-neutral-600">
          One row per line. First row may be a header. Product names must match the catalog (case
          ignored).
        </p>
        <p className="mt-2 text-xs font-medium text-neutral-700">Template (copy into a .csv file):</p>
        <pre className="mt-1 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed text-neutral-800">
          {`productName,quantity
Desert Lime Cream Cleanser,12`}
        </pre>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block w-full max-w-md text-sm text-neutral-700 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-900 hover:file:bg-neutral-50"
          onChange={(e) => handleCsv(e.target.files?.[0] ?? null, e.target)}
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-900">Bulk list</h2>
          {lines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={clearList} className={WS_SECONDARY}>
                Clear list
              </button>
              <button type="button" onClick={addAllToCart} className={WS_PRIMARY}>
                Add all to cart
              </button>
            </div>
          ) : null}
        </div>

        {lines.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center px-4 py-10 text-center">
            <BulkListEmptyIcon />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
              Add products above or upload CSV to begin bulk order
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-100">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-neutral-900">{line.product.name}</div>
                  <div className="text-xs text-neutral-500">
                    {formatAud(line.product.price)} each · stock {line.product.stockQuantity}
                    {line.quantity > line.product.stockQuantity ? (
                      <span className="ml-1 font-medium text-amber-800">
                        · cart caps at {line.product.stockQuantity}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="tabular-nums text-sm font-medium text-neutral-800">Qty {line.quantity}</div>
                <button type="button" onClick={() => removeLine(line.id)} className={WS_SECONDARY_SM}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 ? (
          <div className="mt-6 border-t border-neutral-100 pt-4">
            <Link to="/cart" className={WS_SECONDARY}>
              View cart
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
