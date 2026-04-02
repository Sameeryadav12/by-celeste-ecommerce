import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  listAdminWholesalers,
  moderateAdminWholesaler,
  type AdminWholesaleListRow,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

type WholesaleStatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export function AdminWholesalePage() {
  const [rows, setRows] = useState<AdminWholesaleListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WholesaleStatusFilter>('all')

  async function loadWholesalers() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminWholesalers({
        limit: 100,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setRows(data)
    } catch (e) {
      setError('Could not load wholesale accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWholesalers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  async function handleModeration(
    row: AdminWholesaleListRow,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND',
  ) {
    const confirmed = window.confirm(
      action === 'APPROVE'
        ? `Approve wholesale access for ${row.email}?`
        : action === 'REJECT'
          ? `Reject wholesale application for ${row.email}?`
          : `Suspend wholesale account for ${row.email}?`,
    )
    if (!confirmed) return

    setActionLoadingId(row.id)
    setError(null)
    setMessage(null)
    try {
      await moderateAdminWholesaler(row.id, action)
      setMessage(
        action === 'APPROVE'
          ? 'Wholesale partner approved.'
          : action === 'REJECT'
            ? 'Wholesale partner rejected.'
            : 'Wholesale partner suspended.',
      )
      await loadWholesalers()
    } catch (e) {
      setError('Could not update wholesale partner status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const hasFilters = useMemo(() => search.trim() || statusFilter !== 'all', [search, statusFilter])

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Wholesale</h1>
        <p className="text-sm text-slate-500">
          Review wholesale applications and control who can access wholesale pricing.
        </p>
      </div>

      <Card className="border-slate-200 bg-slate-50/80">
        <p className="text-sm text-slate-700">
          Approved wholesalers can access wholesale pricing. Rejected or suspended users cannot.
        </p>
      </Card>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Wholesale applications and accounts</h2>
            <p className="text-sm text-slate-500">Sorted newest first.</p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, name, or email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WholesaleStatusFilter)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {hasFilters ? <p className="mt-3 text-xs text-slate-500">Filters are applied to this list.</p> : null}

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading wholesale accounts...</div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-base font-medium text-slate-700">No wholesale applications yet</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or status filter.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{row.businessName || 'Business name not provided'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.email}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/wholesale/${row.id}`}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs"
                          disabled={actionLoadingId === row.id || row.status === 'APPROVED'}
                          onClick={() => handleModeration(row, 'APPROVE')}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs"
                          disabled={actionLoadingId === row.id || row.status === 'REJECTED'}
                          onClick={() => handleModeration(row, 'REJECT')}
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs text-rose-700 hover:!bg-rose-50"
                          disabled={actionLoadingId === row.id || row.status === 'SUSPENDED'}
                          onClick={() => handleModeration(row, 'SUSPEND')}
                        >
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
