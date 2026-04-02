import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import {
  listAllCategories,
  listIngredients,
  type AdminProductDetail,
} from '../../../features/admin/adminApi'

export type ProductFormValues = {
  name: string
  slug: string
  shortDescription: string
  description: string
  howToUse: string
  price: string
  wholesalePrice: string
  compareAtPrice: string
  imageUrl: string
  stockQuantity: string
  categoryIds: string[]
  ingredientIds: string[]
  isFeatured: boolean
  isActive: boolean
}

type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

type ProductFormPayload = {
  name: string
  slug?: string
  shortDescription: string
  description: string
  howToUse: string
  price: number
  wholesalePrice?: number
  compareAtPrice?: number
  imageUrl: string
  stockQuantity: number
  categoryIds: string[]
  ingredientIds: string[]
  isFeatured: boolean
  isActive: boolean
}

type OptionCategory = { id: string; name: string; slug: string; isActive: boolean }
type OptionIngredient = { id: string; name: string; slug: string }

export function initialProductFormValues(): ProductFormValues {
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
    stockQuantity: '0',
    categoryIds: [],
    ingredientIds: [],
    isFeatured: false,
    isActive: true,
  }
}

export function productValuesFromDetail(detail: AdminProductDetail): ProductFormValues {
  return {
    name: detail.name,
    slug: detail.slug,
    shortDescription: detail.shortDescription,
    description: detail.description,
    howToUse: detail.howToUse,
    price: detail.price,
    wholesalePrice: detail.wholesalePrice ?? '',
    compareAtPrice: detail.compareAtPrice ?? '',
    imageUrl: detail.imageUrl,
    stockQuantity: String(detail.stockQuantity),
    categoryIds: detail.categories.map((c) => c.id),
    ingredientIds: detail.ingredients.map((i) => i.id),
    isFeatured: detail.isFeatured,
    isActive: detail.isActive,
  }
}

function toggleInArray(ids: string[], id: string) {
  if (ids.includes(id)) return ids.filter((x) => x !== id)
  return [...ids, id]
}

function isValidUrl(value: string) {
  if (value.startsWith('/')) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function AdminProductForm({
  mode,
  initialValues,
  submitting,
  submitError,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initialValues: ProductFormValues
  submitting: boolean
  submitError?: string | null
  onSubmit: (payload: ProductFormPayload) => Promise<void>
}) {
  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [categories, setCategories] = useState<OptionCategory[]>([])
  const [ingredients, setIngredients] = useState<OptionIngredient[]>([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [metaError, setMetaError] = useState<string | null>(null)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  useEffect(() => {
    let cancelled = false
    async function loadMeta() {
      setLoadingMeta(true)
      setMetaError(null)
      try {
        const [cats, ings] = await Promise.all([listAllCategories(true), listIngredients()])
        if (cancelled) return
        setCategories(cats)
        setIngredients(ings)
      } catch (e) {
        if (cancelled) return
        setMetaError(e instanceof Error ? e.message : 'Could not load categories and ingredients.')
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    }
    void loadMeta()
    return () => {
      cancelled = true
    }
  }, [])

  const imagePreviewUrl = useMemo(() => {
    const v = values.imageUrl.trim()
    if (!v || !isValidUrl(v)) return null
    return v
  }, [values.imageUrl])

  function validate(nextValues: ProductFormValues): ProductFormErrors {
    const nextErrors: ProductFormErrors = {}

    if (!nextValues.name.trim()) nextErrors.name = 'Name is required.'
    if (!nextValues.shortDescription.trim()) nextErrors.shortDescription = 'Short description is required.'
    if (!nextValues.description.trim()) nextErrors.description = 'Description is required.'
    if (!nextValues.howToUse.trim()) nextErrors.howToUse = 'How to use is required.'

    const price = Number(nextValues.price)
    if (!nextValues.price.trim()) {
      nextErrors.price = 'Price is required.'
    } else if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'Price must be a positive number.'
    }

    if (nextValues.wholesalePrice.trim()) {
      const wholesale = Number(nextValues.wholesalePrice)
      if (!Number.isFinite(wholesale) || wholesale < 0) {
        nextErrors.wholesalePrice = 'Wholesale price must be a valid number.'
      } else if (Number.isFinite(price) && wholesale > price) {
        nextErrors.wholesalePrice = 'Wholesale price cannot be higher than retail price.'
      }
    }

    if (nextValues.compareAtPrice.trim()) {
      const compareAt = Number(nextValues.compareAtPrice)
      if (!Number.isFinite(compareAt) || compareAt < 0) {
        nextErrors.compareAtPrice = 'Compare-at price must be a valid number.'
      } else if (Number.isFinite(price) && compareAt < price) {
        nextErrors.compareAtPrice = 'Compare-at price cannot be lower than retail price.'
      }
    }

    const stock = Number(nextValues.stockQuantity)
    if (!nextValues.stockQuantity.trim()) {
      nextErrors.stockQuantity = 'Stock quantity is required.'
    } else if (!Number.isInteger(stock) || stock < 0) {
      nextErrors.stockQuantity = 'Stock quantity must be a whole number 0 or greater.'
    }

    const image = nextValues.imageUrl.trim()
    if (!image) {
      nextErrors.imageUrl = 'Image URL is required.'
    } else if (!isValidUrl(image)) {
      nextErrors.imageUrl = 'Use a valid URL (https://...) or a root path (/images/...).'
    }

    return nextErrors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      howToUse: values.howToUse.trim(),
      price: Number(values.price),
      wholesalePrice: values.wholesalePrice.trim() ? Number(values.wholesalePrice) : undefined,
      compareAtPrice: values.compareAtPrice.trim() ? Number(values.compareAtPrice) : undefined,
      imageUrl: values.imageUrl.trim(),
      stockQuantity: Number(values.stockQuantity),
      categoryIds: values.categoryIds,
      ingredientIds: values.ingredientIds,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
      {metaError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {metaError}
        </div>
      ) : null}

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Basic info</h2>
        <p className="mt-1 text-xs text-slate-500">
          Add customer-facing product information and URL slug.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name} required>
            <input
              value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
          <Field label="Slug (optional)" error={errors.slug}>
            <input
              value={values.slug}
              onChange={(e) => setValues((p) => ({ ...p, slug: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave blank to auto-generate from the name.
            </p>
          </Field>
          <Field label="Short description" error={errors.shortDescription} required className="sm:col-span-2">
            <input
              value={values.shortDescription}
              onChange={(e) => setValues((p) => ({ ...p, shortDescription: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Pricing and stock</h2>
        <p className="mt-1 text-xs text-slate-500">
          Set customer price, optional wholesale price, and available stock quantity.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Retail price (AUD)" error={errors.price} required>
            <input
              value={values.price}
              onChange={(e) => setValues((p) => ({ ...p, price: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
          <Field label="Wholesale price (optional)" error={errors.wholesalePrice}>
            <input
              value={values.wholesalePrice}
              onChange={(e) => setValues((p) => ({ ...p, wholesalePrice: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave blank if this product has no wholesale price.
            </p>
          </Field>
          <Field label="Compare-at price (optional)" error={errors.compareAtPrice}>
            <input
              value={values.compareAtPrice}
              onChange={(e) => setValues((p) => ({ ...p, compareAtPrice: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
          <Field label="Stock quantity" error={errors.stockQuantity} required>
            <input
              value={values.stockQuantity}
              onChange={(e) => setValues((p) => ({ ...p, stockQuantity: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use 0 to keep product listed but out of stock.
            </p>
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Product details</h2>
        <p className="mt-1 text-xs text-slate-500">Manage image URL, full details, and usage instructions.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Image URL" error={errors.imageUrl} required className="sm:col-span-2">
            <input
              value={values.imageUrl}
              onChange={(e) => setValues((p) => ({ ...p, imageUrl: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
          {imagePreviewUrl ? (
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-slate-500">Image preview</p>
              <div className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
                <img
                  src={imagePreviewUrl}
                  alt="Product preview"
                  className="h-24 w-24 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          ) : null}
          <Field label="Description" error={errors.description} required className="sm:col-span-2">
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
          <Field label="How to use" error={errors.howToUse} required className="sm:col-span-2">
            <textarea
              rows={3}
              value={values.howToUse}
              onChange={(e) => setValues((p) => ({ ...p, howToUse: e.target.value }))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Category and ingredients</h2>
        <p className="mt-1 text-xs text-slate-500">Connect this product to existing catalogue references.</p>
        {loadingMeta ? (
          <p className="mt-3 text-sm text-slate-500">Loading categories and ingredients...</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Categories ({values.categoryIds.length} selected)
              </p>
              <div className="mt-2 max-h-52 overflow-auto rounded-md border border-slate-200 bg-white p-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 py-1 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={values.categoryIds.includes(c.id)}
                      onChange={() =>
                        setValues((p) => ({
                          ...p,
                          categoryIds: toggleInArray(p.categoryIds, c.id),
                        }))
                      }
                    />
                    <span>{c.name}</span>
                    {!c.isActive ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        Inactive
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                Ingredients ({values.ingredientIds.length} selected)
              </p>
              <div className="mt-2 max-h-52 overflow-auto rounded-md border border-slate-200 bg-white p-2">
                {ingredients.map((i) => (
                  <label key={i.id} className="flex items-center gap-2 py-1 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={values.ingredientIds.includes(i.id)}
                      onChange={() =>
                        setValues((p) => ({
                          ...p,
                          ingredientIds: toggleInArray(p.ingredientIds, i.id),
                        }))
                      }
                    />
                    <span>{i.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Visibility</h2>
        <p className="mt-1 text-xs text-slate-500">
          Choose whether this product appears publicly and whether it is featured.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => setValues((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Active (visible on storefront)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => setValues((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            Featured
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? mode === 'create'
              ? 'Creating product...'
              : 'Saving changes...'
            : mode === 'create'
              ? 'Create product'
              : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
  error,
  required,
  className,
}: {
  label: string
  children: ReactNode
  error?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
