import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import {
  listAdminOrders,
  type AdminOrderListRow,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminOrders({
        limit: 50,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
      })
      setOrders(data)
    } catch (e) {
      setError('Could not load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, paymentFilter])

  function formatCustomer(row: AdminOrderListRow) {
    return row.customer ? `${row.customer.firstName} ${row.customer.lastName}`.trim() : 'Customer'
  }

  const hasFilters = useMemo(
    () => search.trim() || statusFilter !== 'all' || paymentFilter !== 'all',
    [search, statusFilter, paymentFilter],
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">Monitor customer orders, payment state, and fulfilment status.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Order list</h2>
            <p className="text-sm text-slate-500">Newest orders appear first. Use filters to narrow results.</p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900 sm:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All order statuses</option>
              <option value="PENDING">Pending</option>
              <option value="AWAITING_PAYMENT">Awaiting payment</option>
              <option value="PAID">Paid</option>
              <option value="PAYMENT_FAILED">Payment failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All payment statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {hasFilters ? <p className="mt-3 text-xs text-slate-500">Filters are applied to this list.</p> : null}

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-base font-medium text-slate-700">No orders yet</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Order status</th>
                  <th className="px-4 py-3 font-medium">Payment status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{shortOrderId(o.id)}</p>
                      <p className="text-xs text-slate-500">{o.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{formatCustomer(o)}</p>
                      <p className="text-xs text-slate-500">{o.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View details
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

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

function formatCurrency(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n)
}

