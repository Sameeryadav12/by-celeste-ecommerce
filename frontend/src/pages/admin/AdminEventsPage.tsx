import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminEvent,
  listAdminEvents,
  type AdminEventItem,
  updateAdminEvent,
  unpublishAdminEvent,
  uploadAdminEventImage,
} from '../../features/admin/adminApi'
import { resolveMediaUrl } from '../../lib/mediaUrl'
import { AdminStatusBadge } from './components/AdminStatusBadge'

function isValidImageUrl(value: string) {
  if (value.startsWith('/')) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

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
    state: 'VIC',
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
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState<EventForm>(initialForm())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)

  const selectedId = form.id

  const imagePreviewUrl = useMemo(() => {
    const v = form.imageUrl.trim()
    if (!v || !isValidImageUrl(v)) return null
    return resolveMediaUrl(v)
  }, [form.imageUrl])

  useEffect(() => {
    setPreviewFailed(false)
  }, [imagePreviewUrl])

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
      setError('Could not load events.')
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
    setUploadFile(null)
    setUploadError(null)
    setUploadSuccess(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

  function validateUploadFile(file: File): string | null {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, or WebP images are allowed.'
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return 'Image must be 5MB or smaller.'
    }
    return null
  }

  async function handleImageUpload() {
    setUploadError(null)
    setUploadSuccess(null)
    if (!uploadFile) {
      setUploadError('Choose an image file first.')
      return
    }
    const validation = validateUploadFile(uploadFile)
    if (validation) {
      setUploadError(validation)
      return
    }
    setUploading(true)
    try {
      const previousUrl = form.imageUrl.trim()
      const replaceImageUrl = previousUrl.startsWith('/uploads/events/')
        ? previousUrl
        : undefined
      const { imageUrl } = await uploadAdminEventImage(uploadFile, { replaceImageUrl })
      setForm((p) => ({ ...p, imageUrl }))
      setPreviewFailed(false)
      setUploadSuccess('Image uploaded.')
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const start = new Date(form.startDateTimeLocal)
      const end = new Date(form.endDateTimeLocal)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        setError('End date/time must be after the start date/time.')
        setSaving(false)
        return
      }
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
        setMessage('Event updated successfully.')
      } else {
        await createAdminEvent(payload)
        setMessage('Event created successfully.')
      }

      resetForm()
      await loadEvents()
    } catch (e2) {
      setError('Could not save event. Please check the form and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUnpublish(id: string) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await unpublishAdminEvent(id)
      setMessage('Event unpublished.')
      if (form.id === id) resetForm()
      await loadEvents()
    } catch (e) {
      setError('Could not update event publishing status.')
    } finally {
      setSaving(false)
    }
  }

  async function handleQuickPublish(id: string) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await updateAdminEvent(id, { isPublished: true })
      setMessage('Event published.')
      await loadEvents()
    } catch (e) {
      setError('Could not update event publishing status.')
    } finally {
      setSaving(false)
    }
  }

  async function handleQuickFeature(id: string, isFeatured: boolean) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await updateAdminEvent(id, { isFeatured: !isFeatured })
      setMessage(isFeatured ? 'Event removed from featured list.' : 'Event added to featured list.')
      await loadEvents()
    } catch (e) {
      setError('Could not update featured status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Events</h1>
        <p className="text-sm text-slate-500">Create, edit, publish/unpublish, and feature events.</p>
      </div>
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

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

            <div className="space-y-3 sm:col-span-2">
              <p className="text-sm font-medium text-neutral-800">Event image (optional)</p>
              <p className="text-xs text-neutral-500">Upload an image or paste a URL below.</p>

              <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3">
                <p className="text-xs font-medium text-neutral-700">Upload image</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  JPG, PNG, or WebP — max 5MB. Saved as optimized WebP (up to 1200px wide).
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="max-w-full text-xs text-neutral-700 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-200 file:px-2 file:py-1 file:text-xs file:font-medium"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setUploadFile(file)
                      setUploadError(null)
                      setUploadSuccess(null)
                      if (file) {
                        const msg = validateUploadFile(file)
                        if (msg) setUploadError(msg)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    loading={uploading}
                    disabled={uploading || !uploadFile}
                    onClick={() => void handleImageUpload()}
                  >
                    {uploading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
                {uploadError ? (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {uploadError}
                  </p>
                ) : null}
                {uploadSuccess ? (
                  <p className="mt-2 text-xs text-emerald-700" role="status">
                    {uploadSuccess}
                  </p>
                ) : null}
              </div>

              {imagePreviewUrl ? (
                <div>
                  <p className="mb-2 text-xs text-neutral-500">Preview</p>
                  {previewFailed ? (
                    <p className="text-sm text-neutral-500">Image preview unavailable</p>
                  ) : (
                    <div className="inline-flex overflow-hidden rounded-md border border-neutral-200 bg-white">
                      <img
                        src={imagePreviewUrl}
                        alt="Event preview"
                        className="h-24 w-24 object-cover"
                        onError={() => setPreviewFailed(true)}
                      />
                    </div>
                  )}
                </div>
              ) : null}

              <label className="block space-y-1 text-sm">
                <span className="font-medium text-neutral-800">Image URL (optional)</span>
                <input
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                    setPreviewFailed(false)
                  }}
                  placeholder="https://... or /uploads/events/..."
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </label>
            </div>

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
                      {new Date(ev.startDateTime).toLocaleString()} · {ev.locationName}
                    </p>
                    <div className="flex gap-2">
                      <AdminStatusBadge status={ev.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'} />
                      {ev.isFeatured ? <AdminStatusBadge status="FEATURED" /> : null}
                    </div>
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
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => handleQuickFeature(ev.id, ev.isFeatured)}
                    >
                      {ev.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
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

