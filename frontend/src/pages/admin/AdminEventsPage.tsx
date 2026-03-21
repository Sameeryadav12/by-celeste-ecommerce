import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminEvent,
  listAdminEvents,
  type AdminEventItem,
  updateAdminEvent,
  unpublishAdminEvent,
} from '../../features/admin/adminApi'

type EventForm = {
  id?: string
  title: string
  slug: string
  shortDescription: string
  description: string
  locationName: string
  addressLine1: string
  addressLine2: string
  suburb: string
  state: string
  postcode: string
  country: string
  startDateTimeLocal: string
  endDateTimeLocal: string
  imageUrl: string
  isPublished: boolean
  isFeatured: boolean
}

function toInputDateTime(iso: string) {
  // Produces YYYY-MM-DDTHH:mm for datetime-local inputs.
  const d = new Date(iso)
  return d.toISOString().slice(0, 16)
}

function toIsoFromLocal(local: string) {
  // datetime-local value has no timezone; converting using Date(...).toISOString() is acceptable for this admin UI.
  return new Date(local).toISOString()
}

function initialForm(): EventForm {
  return {
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    locationName: '',
    addressLine1: '',
    addressLine2: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    country: 'Australia',
    startDateTimeLocal: '',
    endDateTimeLocal: '',
    imageUrl: '',
    isPublished: true,
    isFeatured: false,
  }
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<EventForm>(initialForm())

  const selectedId = form.id

  const featuredLabel = useMemo(() => {
    return selectedId ? (form.isFeatured ? 'Featured' : 'Not featured') : ''
  }, [form.isFeatured, selectedId])

  async function loadEvents() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminEvents({ includeUnpublished: true, limit: 50 })
      setEvents(data.events as AdminEventItem[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  function onEdit(ev: AdminEventItem) {
    setForm({
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      shortDescription: ev.shortDescription,
      description: ev.description,
      locationName: ev.locationName,
      addressLine1: ev.addressLine1 ?? '',
      addressLine2: ev.addressLine2 ?? '',
      suburb: ev.suburb,
      state: ev.state,
      postcode: ev.postcode,
      country: ev.country,
      startDateTimeLocal: toInputDateTime(ev.startDateTime),
      endDateTimeLocal: toInputDateTime(ev.endDateTime),
      imageUrl: ev.imageUrl ?? '',
      isPublished: ev.isPublished,
      isFeatured: ev.isFeatured,
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
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        locationName: form.locationName.trim(),
        addressLine1: form.addressLine1 || undefined,
        addressLine2: form.addressLine2 || undefined,
        suburb: form.suburb.trim(),
        state: form.state,
        postcode: form.postcode.trim(),
        country: form.country.trim() || 'Australia',
        startDateTime: toIsoFromLocal(form.startDateTimeLocal),
        endDateTime: toIsoFromLocal(form.endDateTimeLocal),
        imageUrl: form.imageUrl.trim() || undefined,
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      }

      if (form.id) {
        await updateAdminEvent(form.id, payload)
      } else {
        await createAdminEvent(payload)
      }

      resetForm()
      await loadEvents()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not save event.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUnpublish(id: string) {
    setSaving(true)
    setError(null)
    try {
      await unpublishAdminEvent(id)
      if (form.id === id) resetForm()
      await loadEvents()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not unpublish event.')
    } finally {
      setSaving(false)
    }
  }

  async function handleQuickPublish(id: string) {
    setSaving(true)
    setError(null)
    try {
      await updateAdminEvent(id, { isPublished: true })
      await loadEvents()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Events</h2>
        <p className="text-sm text-neutral-600">Create, edit, publish/unpublish, and feature events.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800">
                {form.id ? `Editing: ${form.title || 'event'}` : 'Create a new event'}
              </p>
              {form.id ? (
                <p className="text-xs text-neutral-500">
                  {featuredLabel} · ID: {form.id}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              {form.id ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create event'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
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
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Location name</span>
              <input
                required
                value={form.locationName}
                onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))}
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
              <span className="block font-medium text-neutral-800">Full description</span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Suburb</span>
              <input
                required
                value={form.suburb}
                onChange={(e) => setForm((p) => ({ ...p, suburb: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">State</span>
              <select
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Postcode</span>
              <input
                required
                value={form.postcode}
                onChange={(e) => setForm((p) => ({ ...p, postcode: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Country</span>
              <input
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Address line 1 (optional)</span>
              <input
                value={form.addressLine1}
                onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Address line 2 (optional)</span>
              <input
                value={form.addressLine2}
                onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">Start date/time</span>
              <input
                required
                type="datetime-local"
                value={form.startDateTimeLocal}
                onChange={(e) => setForm((p) => ({ ...p, startDateTimeLocal: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-neutral-800">End date/time</span>
              <input
                required
                type="datetime-local"
                value={form.endDateTimeLocal}
                onChange={(e) => setForm((p) => ({ ...p, endDateTimeLocal: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="block font-medium text-neutral-800">Image URL (optional)</span>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://... or /path..."
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
              />
              Featured
            </label>
          </div>
        </form>
      </Card>

      <Card>
        <div className="space-y-1 p-4">
          <h3 className="text-base font-semibold text-neutral-900">Existing events</h3>
          <p className="text-sm text-neutral-600">Click Edit to load event details.</p>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Loading…</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">No events found.</div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {events.map((ev) => (
              <li key={ev.id} className="px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-900">{ev.title}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(ev.startDateTime).toLocaleString()} · {ev.isPublished ? 'Published' : 'Unpublished'}
                    </p>
                    {ev.isFeatured ? <p className="text-xs text-neutral-600">Featured</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(ev)}>
                      Edit
                    </Button>
                    {ev.isPublished ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => handleUnpublish(ev.id)}
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => handleQuickPublish(ev.id)}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

