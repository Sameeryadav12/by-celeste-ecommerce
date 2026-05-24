import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminIngredient,
  deactivateAdminIngredient,
  listAdminIngredients,
  permanentDeleteAdminIngredient,
  updateAdminIngredient,
  type AdminIngredient,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

type IngredientForm = {
  id?: string
  name: string
  slug: string
  description: string
  benefits: string
}

function initialForm(): IngredientForm {
  return { name: '', slug: '', description: '', benefits: '' }
}

export function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState<AdminIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<IngredientForm>(initialForm())

  async function reload() {
    const data = await listAdminIngredients()
    setIngredients(data)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const data = await listAdminIngredients()
        if (!cancelled) setIngredients(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load ingredients.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function onEdit(ing: AdminIngredient) {
    setForm({
      id: ing.id,
      name: ing.name,
      slug: ing.slug,
      description: ing.description,
      benefits: ing.benefits ?? '',
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
        description: form.description.trim(),
        benefits: form.benefits.trim() || undefined,
      }

      if (form.id) {
        await updateAdminIngredient(form.id, payload)
      } else {
        await createAdminIngredient(payload)
      }

      resetForm()
      await reload()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not save ingredient.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(ing: AdminIngredient) {
    const ok = window.confirm(
      `Hide "${ing.name}" from ingredient lists?\n\nLinked products keep their data; this ingredient will not appear in new assignments.`,
    )
    if (!ok) return
    setSaving(true)
    setError(null)
    try {
      await deactivateAdminIngredient(ing.id)
      if (form.id === ing.id) resetForm()
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not hide ingredient.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReactivate(ing: AdminIngredient) {
    setSaving(true)
    setError(null)
    try {
      await updateAdminIngredient(ing.id, { isActive: true })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reactivate ingredient.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePermanentDelete(ing: AdminIngredient) {
    const ok = window.confirm(
      `Permanently delete "${ing.name}"?\n\nProduct order history is safe, but this removes the ingredient record and unlinks it from products.`,
    )
    if (!ok) return
    const ok2 = window.confirm('This cannot be undone. Delete permanently?')
    if (!ok2) return
    setSaving(true)
    setError(null)
    try {
      await permanentDeleteAdminIngredient(ing.id)
      if (form.id === ing.id) resetForm()
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete ingredient.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Ingredients</h1>
        <p className="text-sm text-slate-500">Create, edit, and hide ingredient records.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800">
                {form.id ? `Editing: ${form.name || 'ingredient'}` : 'Create a new ingredient'}
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
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create ingredient'}
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
              <span className="block font-medium text-neutral-800">Benefits (optional)</span>
              <textarea
                rows={3}
                value={form.benefits}
                onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
          </div>
        </form>
      </Card>

      <Card>
        <div className="space-y-1 p-4">
          <h3 className="text-base font-semibold text-neutral-900">Existing ingredients</h3>
          <p className="text-sm text-neutral-600">Hide ingredients instead of deleting when possible.</p>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Loading…</div>
        ) : ingredients.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">No ingredients found.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {ingredients.map((i) => (
              <li key={i.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-neutral-900">{i.name}</p>
                  <p className="text-xs text-neutral-500">{i.slug}</p>
                  <AdminStatusBadge status={i.isActive ? 'ACTIVE' : 'HIDDEN'} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(i)}>
                    Edit
                  </Button>
                  {i.isActive ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => void handleDeactivate(i)}
                    >
                      Hide
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => void handleReactivate(i)}
                    >
                      Show
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs text-rose-700 hover:!bg-rose-50"
                    onClick={() => void handlePermanentDelete(i)}
                  >
                    Delete permanently
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
