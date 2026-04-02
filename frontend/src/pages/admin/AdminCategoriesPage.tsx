import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminCategory,
  deactivateAdminCategory,
  listAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from '../../features/admin/adminApi'

type CategoryForm = {
  id?: string
  name: string
  slug: string
  description: string
  isActive: boolean
}

function initialForm(): CategoryForm {
  return { name: '', slug: '', description: '', isActive: true }
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [includeInactive] = useState(true)
  const [form, setForm] = useState<CategoryForm>(initialForm())

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const data = await listAdminCategories(includeInactive)
        if (!cancelled) setCategories(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load categories.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [includeInactive])

  function onEdit(cat: AdminCategory) {
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      isActive: cat.isActive,
    })
    setError(null)
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
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      }

      if (form.id) {
        await updateAdminCategory(form.id, payload)
      } else {
        await createAdminCategory(payload)
      }

      resetForm()
      const refreshed = await listAdminCategories(includeInactive)
      setCategories(refreshed)
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not save category.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deactivateAdminCategory(id)
      resetForm()
      const refreshed = await listAdminCategories(includeInactive)
      setCategories(refreshed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not deactivate category.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">Create, edit, and manage category visibility.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800">
                {form.id ? `Editing: ${form.name || 'category'}` : 'Create a new category'}
              </p>
              {form.id ? <p className="text-xs text-neutral-500">ID: {form.id}</p> : null}
            </div>
            <div className="flex gap-2">
              {form.id ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create category'}
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
              <span className="block font-medium text-neutral-800">Description (optional)</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active (visible on the website)
            </label>
          </div>
        </form>
      </Card>

      <Card>
        <div className="space-y-1 p-4">
          <h3 className="text-base font-semibold text-neutral-900">Existing categories</h3>
          <p className="text-sm text-neutral-600">Click Edit to load a category.</p>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">No categories found.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-neutral-900">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.slug}</p>
                  <p className="text-sm text-neutral-700">
                    {c.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(c)}>
                    Edit
                  </Button>
                  {c.isActive ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => handleDeactivate(c.id)}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

