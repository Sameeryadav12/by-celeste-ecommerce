import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getAdminMarketingContent,
  updateAdminMarketingContent,
  type AdminMarketingContent,
} from '../../features/admin/adminApi'

const EMPTY: AdminMarketingContent = {
  homepageHeroHeading: '',
  homepageSubtext: '',
  homepageTagline: '',
  featuredProductsHeading: '',
  ingredientsSectionHeading: '',
  ingredientsSectionText: '',
  testimonialsSectionHeading: '',
  testimonialsSectionSubheading: '',
  facebookUrl: '',
  footerTrustWording: '',
  updatedAt: new Date().toISOString(),
}

export function AdminMarketingPage() {
  const [form, setForm] = useState<AdminMarketingContent>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminMarketingContent()
      .then((data) => {
        if (!cancelled) setForm(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load marketing content.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await updateAdminMarketingContent(form)
      setForm(updated)
      setMessage('Marketing content updated successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save marketing content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading marketing content...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Marketing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage practical homepage and footer content without editing code.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Homepage hero</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Homepage hero heading">
              <input
                value={form.homepageHeroHeading}
                onChange={(e) => setForm((p) => ({ ...p, homepageHeroHeading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Tagline emphasis text">
              <input
                value={form.homepageTagline}
                onChange={(e) => setForm((p) => ({ ...p, homepageTagline: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Homepage subtext" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.homepageSubtext}
                onChange={(e) => setForm((p) => ({ ...p, homepageSubtext: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Section headings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Featured products section text">
              <input
                value={form.featuredProductsHeading}
                onChange={(e) => setForm((p) => ({ ...p, featuredProductsHeading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Our Ingredients section text">
              <input
                value={form.ingredientsSectionHeading}
                onChange={(e) => setForm((p) => ({ ...p, ingredientsSectionHeading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Ingredients section description" className="sm:col-span-2">
              <textarea
                rows={2}
                value={form.ingredientsSectionText}
                onChange={(e) => setForm((p) => ({ ...p, ingredientsSectionText: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Testimonials section title">
              <input
                value={form.testimonialsSectionHeading}
                onChange={(e) => setForm((p) => ({ ...p, testimonialsSectionHeading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Testimonials section subtitle">
              <input
                value={form.testimonialsSectionSubheading}
                onChange={(e) => setForm((p) => ({ ...p, testimonialsSectionSubheading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Footer and social links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Facebook page URL">
              <input
                value={form.facebookUrl}
                onChange={(e) => setForm((p) => ({ ...p, facebookUrl: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Footer trust wording">
              <input
                value={form.footerTrustWording}
                onChange={(e) => setForm((p) => ({ ...p, footerTrustWording: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save marketing content'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={['space-y-1 text-sm', className].filter(Boolean).join(' ')}>
      <span className="block font-medium text-slate-800">{label}</span>
      {children}
    </label>
  )
}
