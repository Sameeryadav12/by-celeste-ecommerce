import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createAdminDiscountCoupon,
  deleteAdminDiscountCoupon,
  listAdminDiscountCoupons,
  updateAdminDiscountCoupon,
  type AdminDiscountCoupon,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

type FormState = {
  id?: string
  code: string
  percentage: string
  isActive: boolean
  appliesToCustomers: boolean
  appliesToWholesale: boolean
  startsAt: string
  endsAt: string
  totalUsageLimit: string
  perCustomerLimit: string
}

function emptyForm(): FormState {
  return {
    code: '',
    percentage: '10',
    isActive: true,
    appliesToCustomers: true,
    appliesToWholesale: false,
    startsAt: '',
    endsAt: '',
    totalUsageLimit: '',
    perCustomerLimit: '1',
  }
}

function normaliseCodeInput(value: string): string {
  return value.toUpperCase().replace(/\s+/g, '')
}

function formatRange(startsAt: string | null, endsAt: string | null) {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString()
  if (startsAt && endsAt) return `${fmt(startsAt)} → ${fmt(endsAt)}`
  if (startsAt) return `From ${fmt(startsAt)}`
  if (endsAt) return `Until ${fmt(endsAt)}`
  return 'Always'
}

function audienceLabel(c: AdminDiscountCoupon) {
  if (c.appliesToCustomers && c.appliesToWholesale) return 'Customers + Wholesale'
  if (c.appliesToCustomers) return 'Customers'
  if (c.appliesToWholesale) return 'Wholesale'
  return '—'
}

function couponToForm(c: AdminDiscountCoupon): FormState {
  return {
    id: c.id,
    code: c.code,
    percentage: String(c.percentage),
    isActive: c.isActive,
    appliesToCustomers: c.appliesToCustomers,
    appliesToWholesale: c.appliesToWholesale,
    startsAt: c.startsAt ? c.startsAt.slice(0, 10) : '',
    endsAt: c.endsAt ? c.endsAt.slice(0, 10) : '',
    totalUsageLimit: c.totalUsageLimit != null ? String(c.totalUsageLimit) : '',
    perCustomerLimit: c.perCustomerLimit != null ? String(c.perCustomerLimit) : '',
  }
}

function buildPayload(form: FormState) {
  const percentage = Number(form.percentage)
  return {
    code: normaliseCodeInput(form.code),
    percentage: Number.isFinite(percentage) ? Math.floor(percentage) : 0,
    isActive: form.isActive,
    appliesToCustomers: form.appliesToCustomers,
    appliesToWholesale: form.appliesToWholesale,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : null,
    perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
  }
}

export function AdminDiscountsPage() {
  const [rows, setRows] = useState<AdminDiscountCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [query, setQuery] = useState('')

  async function loadRows() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminDiscountCoupons()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load discount coupons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [])

  function resetForm() {
    setForm(emptyForm())
  }

  function onEdit(c: AdminDiscountCoupon) {
    setForm(couponToForm(c))
    setMessage(null)
    setError(null)
  }

  function clientValidate(): string | null {
    const code = normaliseCodeInput(form.code)
    if (code.length < 3) return 'Coupon code must be at least 3 characters.'
    const pct = Number(form.percentage)
    if (!Number.isFinite(pct) || pct < 1 || pct > 100 || !Number.isInteger(pct)) {
      return 'Percentage must be a whole number between 1 and 100.'
    }
    if (!form.appliesToCustomers && !form.appliesToWholesale) {
      return 'Choose at least one audience: customers or wholesale.'
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      return 'End date must be after the start date.'
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const vErr = clientValidate()
    if (vErr) {
      setError(vErr)
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const body = buildPayload(form)
      if (form.id) {
        await updateAdminDiscountCoupon(form.id, body)
        setMessage('Coupon updated.')
      } else {
        await createAdminDiscountCoupon(body)
        setMessage('Coupon created.')
      }
      resetForm()
      await loadRows()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Could not save coupon.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(row: AdminDiscountCoupon) {
    setError(null)
    setMessage(null)
    try {
      await updateAdminDiscountCoupon(row.id, { isActive: !row.isActive })
      setMessage(row.isActive ? `${row.code} deactivated.` : `${row.code} activated.`)
      await loadRows()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update coupon.')
    }
  }

  async function handleDelete(row: AdminDiscountCoupon) {
    if (!window.confirm(`Permanently delete coupon ${row.code}?`)) return
    if (!window.confirm('This cannot be undone. Delete permanently?')) return
    setError(null)
    setMessage(null)
    try {
      await deleteAdminDiscountCoupon(row.id)
      if (form.id === row.id) resetForm()
      setMessage(`${row.code} deleted.`)
      await loadRows()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete coupon.')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.code.toLowerCase().includes(q))
  }, [rows, query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Discount coupons</h1>
        <p className="mt-1 text-sm text-slate-500">
          Percentage-only coupon codes. Discount is applied to the cart subtotal before the flat
          $12 shipping. Codes are stored in uppercase.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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
              {form.id ? `Edit coupon ${form.code}` : 'Create coupon'}
            </h2>
            <div className="flex gap-2">
              {form.id ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create coupon'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Coupon code</span>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: normaliseCodeInput(e.target.value) }))
                }
                placeholder="BIRTHDAY20"
                spellCheck={false}
                autoCapitalize="characters"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="block text-xs text-slate-400">
                Letters, numbers, dashes or underscores. Auto-uppercased.
              </span>
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Discount percentage</span>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={form.percentage}
                onChange={(e) => setForm((p) => ({ ...p, percentage: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="block text-xs text-slate-400">
                Whole number, 1–100. Applies to subtotal before shipping.
              </span>
            </label>

            <fieldset className="space-y-2 sm:col-span-2">
              <legend className="text-sm font-medium text-slate-800">Eligibility</legend>
              <p className="text-xs text-slate-500">
                Choose who can use this coupon. At least one option is required.
              </p>
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <AudienceOption
                  title="Customers"
                  description="Retail customers can use this coupon."
                  checked={form.appliesToCustomers}
                  onChange={(checked) =>
                    setForm((p) => ({ ...p, appliesToCustomers: checked }))
                  }
                />
                <AudienceOption
                  title="Wholesale"
                  description="Approved wholesale buyers can use this coupon."
                  checked={form.appliesToWholesale}
                  onChange={(checked) =>
                    setForm((p) => ({ ...p, appliesToWholesale: checked }))
                  }
                />
              </div>
              <p className="text-xs text-slate-500">
                Wholesale buyers already receive 50% off. Only enable wholesale if you want an
                extra discount on top of that.
              </p>
            </fieldset>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Start date (optional)</span>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">End date (optional)</span>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Total usage limit (optional)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={form.totalUsageLimit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalUsageLimit: e.target.value }))
                }
                placeholder="Leave blank for unlimited"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block font-medium text-slate-800">Per customer limit</span>
              <input
                type="number"
                min={0}
                step={1}
                value={form.perCustomerLimit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, perCustomerLimit: e.target.value }))
                }
                placeholder="1"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="block text-xs text-slate-400">
                Default 1 (one redemption per customer). Set 0 or blank for no limit.
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Existing coupons</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-72"
          />
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading coupons…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No discount coupons yet.</div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold uppercase tracking-wide text-slate-900">
                      {row.code}
                    </p>
                    <AdminStatusBadge status={row.isActive ? 'VISIBLE' : 'HIDDEN'} />
                    <span className="text-xs text-slate-500">{row.percentage}% off subtotal</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span>Audience: {audienceLabel(row)}</span>
                    <span>Window: {formatRange(row.startsAt, row.endsAt)}</span>
                    <span>
                      Used: {row.usedCount}
                      {row.totalUsageLimit != null ? ` / ${row.totalUsageLimit}` : ''}
                    </span>
                    <span>
                      Per customer:{' '}
                      {row.perCustomerLimit && row.perCustomerLimit > 0
                        ? row.perCustomerLimit
                        : 'No limit'}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs whitespace-nowrap"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs whitespace-nowrap"
                    onClick={() => void toggleActive(row)}
                  >
                    {row.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-3 !py-1.5 text-xs whitespace-nowrap text-rose-700 hover:!bg-rose-50"
                    onClick={() => void handleDelete(row)}
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

function AudienceOption({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label
      className={[
        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition',
        checked
          ? 'border-slate-900 bg-slate-900/[0.03] ring-1 ring-slate-900/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
    </label>
  )
}
