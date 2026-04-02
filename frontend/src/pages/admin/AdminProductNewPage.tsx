import { Link, useNavigate } from 'react-router-dom'
import { createAdminProduct } from '../../features/admin/adminApi'
import { AdminProductForm, initialProductFormValues } from './components/AdminProductForm'
import { useState } from 'react'

export function AdminProductNewPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleCreate(payload: Parameters<typeof createAdminProduct>[0]) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAdminProduct(payload)
      navigate('/admin/products', {
        replace: true,
        state: { flash: 'Product created successfully.' },
      })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not create product.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add new product</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new catalogue product with pricing, stock, and visibility controls.
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
        mode="create"
        initialValues={initialProductFormValues()}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleCreate}
      />
    </div>
  )
}
