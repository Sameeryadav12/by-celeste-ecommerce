import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminProduct,
  deactivateAdminProduct,
  getAdminProduct,
  listAllCategories,
  listAdminProducts,
  listIngredients,
  updateAdminProduct,
  type AdminProductDetail,
} from '../../features/admin/adminApi'

type ProductFormState = {
  id?: string
  name: string
  slug: string
  shortDescription: string
  description: string
  howToUse: string
  price: string
  wholesalePrice: string
  compareAtPrice: string
  imageUrl: string
  isFeatured: boolean
  isActive: boolean
  stockQuantity: string
  categoryIds: string[]
  ingredientIds: string[]
}

function initialForm(): ProductFormState {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    howToUse: '',
    price: '',
    wholesalePrice: '',
    compareAtPrice: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
    stockQuantity: '0',
    categoryIds: [],
    ingredientIds: [],
  }
}

function toggleInArray(ids: string[], id: string) {
  if (ids.includes(id)) return ids.filter((x) => x !== id)
  return [...ids, id]
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof listAdminProducts>>['products']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)

  const [categories, setCategories] = useState<Array<{ id: string; name: string; isActive: boolean }>>([])
  const [ingredients, setIngredients] = useState<Array<{ id: string; name: string }>>([])

  const [form, setForm] = useState<ProductFormState>(initialForm())
  const [saving, setSaving] = useState(false)

  const mode = form.id ? 'edit' : 'create'

  const selectedCategoryCount = useMemo(() => form.categoryIds.length, [form.categoryIds.length])

  useEffect(() => {
    let cancelled = false

    async function loadLists() {
      const [cats, ings] = await Promise.all([listAllCategories(true), listIngredients()])
      if (cancelled) return

      setCategories(cats)
      setIngredients(ings)
    }

    void loadLists().catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load lists.')
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
        limit: 20,
        search: search.trim() || undefined,
        activeOnly: showInactive ? false : true,
      })
      setProducts(res.products)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showInactive])

  async function handleEdit(productId: string) {
    setError(null)
    try {
      const product: AdminProductDetail = await getAdminProduct(productId)
      setForm({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        howToUse: product.howToUse,
        price: product.price,
        wholesalePrice: product.wholesalePrice ?? '',
        compareAtPrice: product.compareAtPrice ?? '',
        imageUrl: product.imageUrl,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        stockQuantity: String(product.stockQuantity),
        categoryIds: product.categories.map((c) => c.id),
        ingredientIds: product.ingredients.map((i) => i.id),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load product details.')
    }
  }

  function resetForm() {
    setForm(initialForm())
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        howToUse: form.howToUse.trim(),
        price: Number(form.price),
        wholesalePrice: form.wholesalePrice.trim() ? Number(form.wholesalePrice) : undefined,
        compareAtPrice: form.compareAtPrice.trim() ? Number(form.compareAtPrice) : undefined,
        imageUrl: form.imageUrl.trim(),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        stockQuantity: Number(form.stockQuantity),
        categoryIds: form.categoryIds,
        ingredientIds: form.ingredientIds,
      }

      if (form.id) {
        await updateAdminProduct(form.id, payload)
      } else {
        await createAdminProduct(payload)
      }

      resetForm()
      await loadProducts()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(productId: string) {
    setError(null)
    try {
      await deactivateAdminProduct(productId)
      if (form.id === productId) resetForm()
      await loadProducts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not deactivate product.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Products</h2>
        <p className="text-sm text-neutral-600">Create and update catalog products (retail + optional wholesale price).</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800">
                {mode === 'edit' ? `Editing: ${form.name || 'product'}` : 'Create a new product'}
              </p>
              {mode === 'edit' ? <p className="text-xs text-neutral-500">ID: {form.id}</p> : null}
            </div>
            <div className="flex gap-2">
              {mode === 'edit' ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create product'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Slug (optional)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">Short description</span>
              <input
                required
                value={form.shortDescription}
                onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">Description</span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">How to use</span>
              <textarea
                required
                rows={3}
                value={form.howToUse}
                onChange={(e) => setForm((p) => ({ ...p, howToUse: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Retail price (AUD)</span>
              <input
                required
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Wholesale price (optional)</span>
              <input
                value={form.wholesalePrice}
                onChange={(e) => setForm((p) => ({ ...p, wholesalePrice: e.target.value }))}
                placeholder="Leave blank for none"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Compare-at price (optional)</span>
              <input
                value={form.compareAtPrice}
                onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                placeholder="Leave blank if none"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Stock quantity</span>
              <input
                required
                value={form.stockQuantity}
                onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">Image URL (required)</span>
              <input
                required
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-1">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active (visible to customers)
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-1">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
              />
              Featured
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-800">
                Categories ({selectedCategoryCount} selected)
              </p>
              <div className="max-h-44 overflow-auto rounded-md border border-neutral-200 bg-white p-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(c.id)}
                      onChange={() =>
                        setForm((p) => ({ ...p, categoryIds: toggleInArray(p.categoryIds, c.id) }))
                      }
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-800">
                Ingredients ({form.ingredientIds.length} selected)
              </p>
              <div className="max-h-44 overflow-auto rounded-md border border-neutral-200 bg-white p-2">
                {ingredients.map((i) => (
                  <label key={i.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={form.ingredientIds.includes(i.id)}
                      onChange={() =>
                        setForm((p) => ({ ...p, ingredientIds: toggleInArray(p.ingredientIds, i.id) }))
                      }
                    />
                    <span className="truncate">{i.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-900">Existing products</h3>
            <p className="text-sm text-neutral-600">Click a product to edit or deactivate it.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900 sm:w-64"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              Include inactive
            </label>
            <Button type="button" variant="ghost" onClick={resetForm}>
              New product
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2 text-sm text-neutral-600">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="mt-4 text-sm text-neutral-600">No products found.</div>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-100">
            {products.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500">{p.slug}</p>
                  <p className="text-sm text-neutral-700">
                    Retail price: <span className="font-semibold">{p.price}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => handleEdit(p.id)}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => handleDeactivate(p.id)}>
                    Deactivate
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

