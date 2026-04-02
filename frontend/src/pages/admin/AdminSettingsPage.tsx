import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  getAdminBusinessSettings,
  updateAdminBusinessSettings,
  type AdminBusinessSettings,
} from '../../features/admin/adminApi'

const EMPTY: AdminBusinessSettings = {
  businessDisplayName: 'By Celeste',
  footerLocationWording: 'Leneva Victoria, Australia',
  footerSupportText:
    'For order questions, use the details on your confirmation or reach out through your account when signed in.',
  facebookUrl: 'https://www.facebook.com',
  trustStripWording: 'Handcrafted in regional Victoria · Boutique Australian skincare',
  shippingMethodLabel: 'Flat rate shipping',
  shippingAmountDisplay: '$12.00',
  shippingCarrierWording: 'Australia Post',
  shippingExplanatoryNote: 'Flat-rate shipping applies to all domestic orders.',
  australiaPostCarrierWording: 'Australia Post (standard)',
  updatedAt: new Date().toISOString(),
}

export function AdminSettingsPage() {
  const [form, setForm] = useState<AdminBusinessSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminBusinessSettings()
      .then((data) => {
        if (!cancelled) setForm(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load business settings.')
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
      const updated = await updateAdminBusinessSettings(form)
      setForm(updated)
      setMessage('Business settings updated successfully.')
    } catch (e) {
      setError('Could not save business settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading business settings...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage contact, social, shipping wording, and footer business content safely.
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
          <h2 className="text-base font-semibold text-slate-900">Contact details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Business display name">
              <input
                value={form.businessDisplayName}
                onChange={(e) => setForm((p) => ({ ...p, businessDisplayName: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Footer location wording">
              <input
                value={form.footerLocationWording}
                onChange={(e) => setForm((p) => ({ ...p, footerLocationWording: e.target.value }))}
                placeholder="Leneva Victoria, Australia"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Footer supporting text" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.footerSupportText}
                onChange={(e) => setForm((p) => ({ ...p, footerSupportText: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Social links</h2>
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
                value={form.trustStripWording}
                onChange={(e) => setForm((p) => ({ ...p, trustStripWording: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Shipping and business wording</h2>
          <p className="mt-1 text-xs text-slate-500">
            These settings control visible wording. Checkout pricing logic remains fixed at flat $12 for now.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Shipping method label">
              <input
                value={form.shippingMethodLabel}
                onChange={(e) => setForm((p) => ({ ...p, shippingMethodLabel: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Shipping amount (display)">
              <input
                value={form.shippingAmountDisplay}
                onChange={(e) => setForm((p) => ({ ...p, shippingAmountDisplay: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Shipping carrier wording">
              <input
                value={form.shippingCarrierWording}
                onChange={(e) => setForm((p) => ({ ...p, shippingCarrierWording: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Australia Post carrier wording">
              <input
                value={form.australiaPostCarrierWording}
                onChange={(e) => setForm((p) => ({ ...p, australiaPostCarrierWording: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Shipping explanatory note" className="sm:col-span-2">
              <textarea
                rows={2}
                value={form.shippingExplanatoryNote}
                onChange={(e) => setForm((p) => ({ ...p, shippingExplanatoryNote: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save business settings'}
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
