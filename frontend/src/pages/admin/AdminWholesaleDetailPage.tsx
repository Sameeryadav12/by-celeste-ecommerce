import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  getAdminWholesaler,
  moderateAdminWholesaler,
  type AdminWholesaleDetail,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminWholesaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [wholesaler, setWholesaler] = useState<AdminWholesaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const wholesalerId = id
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAdminWholesaler(wholesalerId)
        if (!cancelled) setWholesaler(data)
      } catch (e) {
        if (!cancelled) setError('Could not load wholesale account.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleModeration(action: 'APPROVE' | 'REJECT' | 'SUSPEND') {
    if (!id || !wholesaler) return
    const confirmed = window.confirm(
      action === 'APPROVE'
        ? `Approve ${wholesaler.email} for wholesale pricing access?`
        : action === 'REJECT'
          ? `Reject wholesale application for ${wholesaler.email}?`
          : `Suspend wholesale account for ${wholesaler.email}?`,
    )
    if (!confirmed) return

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await moderateAdminWholesaler(id, action)
      setWholesaler((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status,
              wholesaleApprovalStatus: updated.wholesaleApprovalStatus,
              isActive: updated.isActive,
              approvedAt: updated.approvedAt,
              updatedAt: updated.updatedAt,
            }
          : prev,
      )
      setMessage(
        action === 'APPROVE'
          ? 'Wholesale partner approved.'
          : action === 'REJECT'
            ? 'Wholesale partner rejected.'
            : 'Wholesale partner suspended.',
      )
    } catch (e) {
      setError('Could not update wholesale account status.')
    } finally {
      setSaving(false)
    }
  }

  if (!id) return <p className="text-sm text-red-700">Wholesale user id is missing.</p>
  if (loading) return <p className="text-sm text-slate-500">Loading wholesale details...</p>
  if (error && !wholesaler) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        <Link
          to="/admin/wholesale"
          className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Back to wholesale list
        </Link>
      </div>
    )
  }
  if (!wholesaler) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Wholesale account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review application details and manage wholesale access safely.
          </p>
        </div>
        <Link
          to="/admin/wholesale"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Back to wholesale list
        </Link>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Application details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DataRow label="Business name" value={wholesaler.businessName || '—'} />
            <DataRow label="Applicant" value={`${wholesaler.firstName} ${wholesaler.lastName}`} />
            <DataRow label="Email" value={wholesaler.email} />
            <DataRow label="Phone" value={wholesaler.phone || 'Not available'} />
            <DataRow label="ABN" value={wholesaler.abn || 'Not provided'} />
            <DataRow label="Created" value={new Date(wholesaler.createdAt).toLocaleString()} />
            <DataRow label="Approved at" value={wholesaler.approvedAt ? new Date(wholesaler.approvedAt).toLocaleString() : 'Not approved'} />
            <DataRow label="Last updated" value={new Date(wholesaler.updatedAt).toLocaleString()} />
          </div>
          {wholesaler.wholesaleNotes ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Application notes</p>
              <p className="mt-1 text-sm text-slate-700">{wholesaler.wholesaleNotes}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Moderation</h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-600">Current status:</span>
            <AdminStatusBadge status={wholesaler.status} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Approve to allow wholesale pricing access. Reject or suspend to block wholesale benefits.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={saving || wholesaler.status === 'APPROVED'}
              onClick={() => handleModeration('APPROVE')}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={saving || wholesaler.status === 'REJECTED'}
              onClick={() => handleModeration('REJECT')}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-rose-700 hover:!bg-rose-50"
              disabled={saving || wholesaler.status === 'SUSPENDED'}
              onClick={() => handleModeration('SUSPEND')}
            >
              Suspend
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Product compliance foundation</h2>
        <p className="mt-2 text-sm text-slate-600">
          This section is prepared for wholesaler-product compliance controls.
        </p>
        {wholesaler.compliance.productOwnershipModeled ? (
          <p className="mt-3 text-sm text-slate-700">
            Product ownership is modeled. Related products can be reviewed and hidden here.
          </p>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Product controls are prepared</p>
            <p className="mt-1 text-xs text-slate-500">{wholesaler.compliance.note}</p>
            <p className="mt-1 text-xs text-slate-500">
              A future backend relationship is needed to support direct wholesaler-linked product moderation.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value}</p>
    </div>
  )
}
