import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminTestimonial,
  deleteAdminTestimonial,
  listAdminTestimonials,
  updateAdminTestimonial,
  type AdminTestimonial,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

type FormState = {
  id?: string
  customerName: string
  text: string
  isVisible: boolean
  isFeatured: boolean
}

function initialForm(): FormState {
  return {
    customerName: '',
    text: '',
    isVisible: true,
    isFeatured: false,
  }
}

export function AdminTestimonialsPage() {
  const [rows, setRows] = useState<AdminTestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<FormState>(initialForm())

  async function loadRows() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminTestimonials()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [])

  function onEdit(row: AdminTestimonial) {
    setForm({
      id: row.id,
      customerName: row.customerName,
      text: row.text,
      isVisible: row.isVisible,
      isFeatured: row.isFeatured,
    })
  }

  function resetForm() {
    setForm(initialForm())
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.text.trim()) {
      setError('Customer name and testimonial text are required.')
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      if (form.id) {
        await updateAdminTestimonial(form.id, {
          customerName: form.customerName.trim(),
          text: form.text.trim(),
          isVisible: form.isVisible,
          isFeatured: form.isFeatured,
        })
      } else {
        await createAdminTestimonial({
          customerName: form.customerName.trim(),
          text: form.text.trim(),
          isVisible: form.isVisible,
          isFeatured: form.isFeatured,
        })
      }
      setMessage(form.id ? 'Testimonial updated successfully.' : 'Testimonial added successfully.')
      resetForm()
      await loadRows()
    } catch (e2) {
      setError('Could not save testimonial. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleVisibility(row: AdminTestimonial) {
    setMessage(null)
    setError(null)
    try {
      await updateAdminTestimonial(row.id, { isVisible: !row.isVisible })
      setMessage(row.isVisible ? 'Testimonial hidden from website.' : 'Testimonial shown on website.')
      await loadRows()
    } catch (e) {
      setError('Could not update testimonial visibility.')
    }
  }

  async function handleDelete(row: AdminTestimonial) {
    if (!window.confirm(`Delete testimonial from ${row.customerName}? This cannot be undone.`)) return
    setMessage(null)
    setError(null)
    try {
      await deleteAdminTestimonial(row.id)
      setMessage('Testimonial deleted.')
      if (form.id === row.id) resetForm()
      await loadRows()
    } catch (e) {
      setError('Could not delete testimonial.')
    }
  }

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return r.customerName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Testimonials</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add, edit, feature, and hide testimonials shown on the storefront.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {form.id ? 'Edit testimonial' : 'Add testimonial'}
            </h2>
            <div className="flex gap-2">
              {form.id ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : form.id ? 'Save changes' : 'Add testimonial'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Customer name</span>
              <input
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>
            <label className="flex items-center gap-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.checked }))}
                />
                Visible on website
              </span>
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                />
                Featured
              </span>
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-slate-800">Testimonial text</span>
              <textarea
                rows={4}
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Existing testimonials</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or text"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-80"
          />
        </div>
        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading testimonials...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No testimonials found.</div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {filtered.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{row.customerName}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{row.text}</p>
                  <div className="flex gap-2">
                    <AdminStatusBadge status={row.isVisible ? 'VISIBLE' : 'HIDDEN'} />
                    {row.isFeatured ? <AdminStatusBadge status="FEATURED" /> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(row)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs"
                    onClick={() => handleVisibility(row)}
                  >
                    {row.isVisible ? 'Hide' : 'Unhide'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs text-rose-700 hover:!bg-rose-50"
                    onClick={() => handleDelete(row)}
                  >
                    Delete
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
