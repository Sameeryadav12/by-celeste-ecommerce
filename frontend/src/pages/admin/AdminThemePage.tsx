import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { resolveMediaUrl } from '../../lib/mediaUrl'
import {
  getAdminThemeSettings,
  updateAdminThemeSettings,
  type AdminThemeSettings,
} from '../../features/admin/adminApi'

function displayAssetPath(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  try {
    return decodeURIComponent(t)
  } catch {
    return t
  }
}

function LogoPathField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder: string
  hint: string
}) {
  const display = displayAssetPath(value)
  const previewSrc = value.trim() ? resolveMediaUrl(value.trim()) : ''
  const looksLikeImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value.trim())

  return (
    <label className="space-y-1 text-sm sm:col-span-2">
      <span className="block font-medium text-slate-800">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-slate-900"
      />
      <p className="text-xs text-slate-500">{hint}</p>
      {display ? (
        <p className="text-xs text-slate-600">
          File: <span className="font-medium text-slate-800">{display}</span>
        </p>
      ) : (
        <p className="text-xs text-slate-500">Leave blank to use the default storefront logo.</p>
      )}
      {previewSrc && looksLikeImage ? (
        <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-3">
          <img src={previewSrc} alt="" className="max-h-14 max-w-[200px] object-contain" />
        </div>
      ) : null}
    </label>
  )
}

const EMPTY: AdminThemeSettings = {
  primaryBrandColor: '#171717',
  secondaryBrandColor: '#64748b',
  buttonStyleEmphasis: 'solid',
  homepageHeroEmphasis: true,
  trustBadgesVisible: true,
  trustBadgeHeading: 'Trusted by our community',
  headerLogoPath: '',
  footerLogoPath: '',
  trustBadgeIconPath: '',
  updatedAt: new Date().toISOString(),
}

export function AdminThemePage() {
  const [form, setForm] = useState<AdminThemeSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminThemeSettings()
      .then((data) => {
        if (!cancelled) setForm(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load theme settings.')
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
      const updated = await updateAdminThemeSettings(form)
      setForm(updated)
      setMessage('Theme settings updated successfully.')
    } catch (e) {
      setError('Could not save theme settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading theme settings...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Theme / Appearance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage safe brand appearance controls without changing core layout code.
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
          <h2 className="text-base font-semibold text-slate-900">Brand colors</h2>
          <p className="mt-1 text-xs text-slate-500">Used for controlled accent styling in key storefront areas.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Primary brand color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryBrandColor}
                  onChange={(e) => setForm((p) => ({ ...p, primaryBrandColor: e.target.value }))}
                  className="h-9 w-12 rounded border border-slate-300 bg-white p-1"
                />
                <input
                  value={form.primaryBrandColor}
                  onChange={(e) => setForm((p) => ({ ...p, primaryBrandColor: e.target.value }))}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Secondary/accent color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryBrandColor}
                  onChange={(e) => setForm((p) => ({ ...p, secondaryBrandColor: e.target.value }))}
                  className="h-9 w-12 rounded border border-slate-300 bg-white p-1"
                />
                <input
                  value={form.secondaryBrandColor}
                  onChange={(e) => setForm((p) => ({ ...p, secondaryBrandColor: e.target.value }))}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1">
              <span className="h-3 w-3 rounded" style={{ background: form.primaryBrandColor }} />
              Primary
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1">
              <span className="h-3 w-3 rounded" style={{ background: form.secondaryBrandColor }} />
              Secondary
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Homepage appearance</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Button style emphasis</span>
              <select
                value={form.buttonStyleEmphasis}
                onChange={(e) => setForm((p) => ({ ...p, buttonStyleEmphasis: e.target.value as 'solid' | 'soft' }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="solid">Solid emphasis</option>
                <option value="soft">Soft emphasis</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.homepageHeroEmphasis}
                onChange={(e) => setForm((p) => ({ ...p, homepageHeroEmphasis: e.target.checked }))}
              />
              Highlight homepage hero heading
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Brand assets and trust accents</h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter a site path such as <span className="font-mono">/images/branding/Celeste logo.png</span>{' '}
            (spaces are fine). Avoid pasting encoded URLs unless needed.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LogoPathField
              label="Header logo"
              value={form.headerLogoPath}
              onChange={(headerLogoPath) => setForm((p) => ({ ...p, headerLogoPath }))}
              placeholder="/images/branding/Celeste logo.png"
              hint="Shown in the site header."
            />
            <LogoPathField
              label="Footer logo"
              value={form.footerLogoPath}
              onChange={(footerLogoPath) => setForm((p) => ({ ...p, footerLogoPath }))}
              placeholder="/images/branding/Celeste logo.png"
              hint="Shown in the footer."
            />
            <LogoPathField
              label="Trust badge icon (optional)"
              value={form.trustBadgeIconPath}
              onChange={(trustBadgeIconPath) => setForm((p) => ({ ...p, trustBadgeIconPath }))}
              placeholder="/icons/australian-made.svg"
              hint="Small icon beside the trust strip."
            />
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Trust badges heading</span>
              <input
                value={form.trustBadgeHeading}
                onChange={(e) => setForm((p) => ({ ...p, trustBadgeHeading: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.trustBadgesVisible}
                onChange={(e) => setForm((p) => ({ ...p, trustBadgesVisible: e.target.checked }))}
              />
              Show trust badge strip on storefront
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save theme settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
