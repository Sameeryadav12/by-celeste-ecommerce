import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAdminProduct, updateAdminProduct, type AdminProductDetail } from '../../features/admin/adminApi'
import { AdminProductForm, productValuesFromDetail } from './components/AdminProductForm'

export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<AdminProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const detail = await getAdminProduct(id)
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
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not update product.')
    } finally {
      setSubmitting(false)
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
            Update product details, pricing, stock, category links, and visibility.
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
    </div>
  )
}
