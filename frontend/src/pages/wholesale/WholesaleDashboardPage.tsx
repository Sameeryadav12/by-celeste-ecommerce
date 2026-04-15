import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { fetchMyOrders, type AccountOrderSummary } from '../../features/account/accountApi'
import { OrderStatusBadge } from '../../features/account/components/OrderStatusBadge'
import { PaymentStatusBadge } from '../../features/account/components/PaymentStatusBadge'
import { formatAud } from '../../features/cart/money'
import { WS_PRIMARY, WS_SECONDARY, WS_SECONDARY_SM } from './wholesaleUi'

function wholesaleStatusLabel(status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE') {
  switch (status) {
    case 'APPROVED':
      return 'Approved'
    case 'PENDING':
      return 'Pending review'
    case 'REJECTED':
      return 'Not approved'
    default:
      return 'Unknown'
  }
}

function StatusPill({ status }: { status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE' }) {
  const tone =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : status === 'REJECTED'
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-neutral-50 text-neutral-700 border-neutral-200'

  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', tone].join(' ')}>
      {wholesaleStatusLabel(status)}
    </span>
  )
}

function formatOrderDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

export function WholesaleDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<AccountOrderSummary[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const res = await fetchMyOrders()
        if (!cancelled) setOrders(res.orders)
      } catch (e) {
        if (!cancelled) {
          setOrdersError(e instanceof Error ? e.message : 'Could not load orders.')
        }
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])
  const totalItems = useMemo(
    () => orders.reduce((sum, o) => sum + (Number.isFinite(o.itemCount) ? o.itemCount : 0), 0),
    [orders],
  )
  const latestOrderAt = useMemo(() => {
    if (!orders.length) return null
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return sorted[0]?.createdAt ?? null
  }, [orders])

  const approval = (user?.wholesaleApprovalStatus ?? 'NONE') as 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE'

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Wholesale Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">
          Snapshot of your wholesale orders and partner access.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
        <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Wholesale orders</div>
          <div className="mt-1 font-serif text-3xl font-semibold tabular-nums leading-none text-neutral-900">
            {ordersLoading ? '—' : orders.length}
          </div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Items ordered</div>
          <div className="mt-1 font-serif text-3xl font-semibold tabular-nums leading-none text-neutral-900">
            {ordersLoading ? '—' : totalItems}
          </div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Latest order</div>
          <div className="mt-1 text-lg font-semibold leading-tight text-neutral-900">
            {ordersLoading ? '—' : latestOrderAt ? formatOrderDateShort(latestOrderAt) : 'None yet'}
          </div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Approval</div>
          <div className="mt-1 flex items-end">
            <StatusPill status={approval} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
          {orders.length > 0 ? (
            <Link to="/wholesale/orders" className={WS_SECONDARY_SM}>
              View all
            </Link>
          ) : null}
        </div>

        {ordersError ? (
          <p className="mt-3 text-sm text-red-700">{ordersError}</p>
        ) : ordersLoading ? (
          <p className="mt-3 text-sm text-neutral-600">Loading orders…</p>
        ) : recentOrders.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-900">No wholesale orders yet</p>
            <Link to="/wholesale/shop" className={`${WS_PRIMARY} mt-4`}>
              Browse wholesale shop
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Order</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Total</th>
                  <th className="pb-2 pr-3 font-medium">Order status</th>
                  <th className="pb-2 pr-3 font-medium">Payment</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 align-middle">
                      <div className="font-medium text-neutral-900">{shortOrderId(o.id)}</div>
                      <div className="mt-0.5 max-w-[200px] truncate font-mono text-[11px] text-neutral-400">
                        {o.id}
                      </div>
                    </td>
                    <td className="py-3 pr-3 align-middle text-neutral-600">{formatOrderDateShort(o.createdAt)}</td>
                    <td className="py-3 pr-3 align-middle font-medium tabular-nums text-neutral-900">
                      {formatAud(Number.parseFloat(o.totalAmount))}
                    </td>
                    <td className="py-3 pr-3 align-middle">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 pr-3 align-middle">
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="py-3 align-middle">
                      <Link to={`/wholesale/orders/${o.id}`} className={WS_SECONDARY_SM}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Quick actions</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/wholesale/shop" className={WS_PRIMARY}>
            Shop wholesale
          </Link>
          <Link to="/wholesale/orders" className={WS_SECONDARY}>
            View orders
          </Link>
          <Link to="/wholesale/account" className={WS_SECONDARY}>
            My account
          </Link>
          <Link to="/wholesale/bulk-orders" className={WS_SECONDARY}>
            Bulk orders
          </Link>
        </div>
      </section>
    </div>
  )
}
