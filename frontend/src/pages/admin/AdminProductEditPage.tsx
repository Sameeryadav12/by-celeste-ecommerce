import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  deleteAdminProduct,
  getAdminProduct,
  updateAdminProduct,
  type AdminProductDetail,
} from '../../features/admin/adminApi'
import { AdminProductForm, productValuesFromDetail } from './components/AdminProductForm'

export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<AdminProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dangerBusy, setDangerBusy] = useState(false)
  const [dangerError, setDangerError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const productId = id
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const detail = await getAdminProduct(productId)
        if (!cancelled) setProduct(detail)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Could not load product.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleUpdate(payload: Parameters<typeof updateAdminProduct>[1]) {
    if (!id) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateAdminProduct(id, payload)
      navigate('/admin/products', {
        replace: true,
        state: { flash: 'Product updated successfully.' },
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePermanentDelete() {
    if (!id || !product) return

    const ok = window.confirm(
      `Permanently delete "${product.name}"?\n\nOnly use this if the product was added by mistake. Order history keeps line snapshots but the catalogue row is removed.\n\nContinue?`,
    )
    if (!ok) return

    const typed = window.prompt(
      `Type the product name exactly to confirm permanent delete:\n\n${product.name}`,
    )
    if (typed?.trim() !== product.name) {
      setDangerError('Delete cancelled — name did not match.')
      return
    }

    setDangerBusy(true)
    setDangerError(null)
    try {
      await deleteAdminProduct(id)
      navigate('/admin/products', {
        replace: true,
        state: { flash: `"${product.name}" was permanently deleted.` },
      })
    } catch (e) {
      setDangerError(e instanceof Error ? e.message : 'Could not delete product.')
    } finally {
      setDangerBusy(false)
    }
  }

  if (!id) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Product ID is missing.
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading product details...</p>
  }

  if (loadError || !product) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError ?? 'Product not found.'}
        </div>
        <Link
          to="/admin/products"
          className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit product</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update details, upload images, pricing, and visibility. Use <strong>Hide</strong> on the
            product list to remove from the shop without deleting.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Back to products
        </Link>
      </div>

      <AdminProductForm
        mode="edit"
        initialValues={productValuesFromDetail(product)}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleUpdate}
      />

      <Card className="!border-red-100 !bg-red-50/30">
        <h2 className="text-sm font-semibold text-red-900">Advanced — permanent delete</h2>
        <p className="mt-2 text-sm text-red-800/90">
          Removes this product from the database. Prefer <strong>Hide</strong> on the product list so
          past orders keep full product links. Image upload above still works for normal edits.
        </p>
        {dangerError ? (
          <p className="mt-2 text-sm text-red-700">{dangerError}</p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="mt-3 !border !border-red-300 !text-red-800 hover:!bg-red-100"
          loading={dangerBusy}
          disabled={dangerBusy}
          onClick={() => void handlePermanentDelete()}
        >
          Permanently delete product
        </Button>
      </Card>
    </div>
  )
}
