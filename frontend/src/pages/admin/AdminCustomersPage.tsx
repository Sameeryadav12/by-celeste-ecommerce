import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AdminTableSkeleton } from '../../features/admin/components/AdminTableSkeleton'
import {
  downloadAdminCustomersCsv,
  listAdminCustomers,
  type AdminCustomerListRow,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'WHOLESALE'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [exportBusy, setExportBusy] = useState(false)

  async function loadCustomers() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminCustomers({
        limit: 100,
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
      })
      setCustomers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter])

  async function handleExportCsv() {
    setExportBusy(true)
    setError(null)
    try {
      await downloadAdminCustomersCsv({
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export customers.')
    } finally {
      setExportBusy(false)
    }
  }

  const hasFilters = useMemo(
    () => search.trim() || roleFilter !== 'ALL' || statusFilter !== 'all',
    [search, roleFilter, statusFilter],
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">
          View accounts, order counts, loyalty points, and account status.
        </p>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0">{error}</p>
          <Button type="button" variant="primary" onClick={() => void loadCustomers()}>
            Retry
          </Button>
        </div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">Customer list</h2>
              <p className="text-sm text-slate-500">Search by name or email. Open a row for full details.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              loading={exportBusy}
              disabled={exportBusy}
              onClick={() => void handleExportCsv()}
            >
              Export CSV
            </Button>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All customer types</option>
              <option value="CUSTOMER">Retail customer</option>
              <option value="WHOLESALE">Wholesale</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        {hasFilters ? <p className="mt-3 text-xs text-slate-500">Filters applied.</p> : null}

        {loading ? (
          <AdminTableSkeleton rows={8} columns={8} />
        ) : customers.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-base font-medium text-slate-700">No accounts found</p>
            <p className="mt-1 text-sm text-slate-500">
              Run <code className="text-xs">npm run seed:demo-customer</code> in backend for a demo account.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Signed up</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Loyalty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">{c.orderCount}</td>
                    <td className="px-4 py-3">{c.loyaltyPointsBalance}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/customers/${c.id}`}
                        className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </Link>
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
