import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Seo } from '../../components/seo/Seo'
import { fetchMyOrders, type AccountOrderSummary } from '../../features/account/accountApi'
import { OrderStatusBadge } from '../../features/account/components/OrderStatusBadge'
import { PaymentStatusBadge } from '../../features/account/components/PaymentStatusBadge'
import { formatAud } from '../../features/cart/money'
import { Card } from '../../components/ui/Card'
import { WS_PRIMARY, WS_SECONDARY_SM } from './wholesaleUi'

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

export function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<AccountOrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchMyOrders()
        if (!cancelled) setOrders(res.orders)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load your orders right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const hasOrders = orders.length > 0

  const totalItemsAcrossOrders = useMemo(
    () => orders.reduce((sum, o) => sum + (Number.isFinite(o.itemCount) ? o.itemCount : 0), 0),
    [orders],
  )

  return (
    <>
      <Seo title="Wholesale Orders | By Celeste" description="View and reorder your wholesale purchases." />

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Wholesale Dashboard
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Orders</h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-700">
            Review orders placed using your wholesale account. Newest orders appear first.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 md:items-stretch">
          <Card className="flex min-h-[6.5rem] flex-col justify-between p-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Total orders</div>
            <div className="mt-1 font-serif text-3xl font-semibold tabular-nums leading-none text-neutral-900">
              {loading ? '—' : orders.length}
            </div>
          </Card>
          <Card className="flex min-h-[6.5rem] flex-col justify-between p-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              Total items (all orders)
            </div>
            <div className="mt-1 font-serif text-3xl font-semibold tabular-nums leading-none text-neutral-900">
              {loading ? '—' : totalItemsAcrossOrders}
            </div>
          </Card>
          <Card className="flex min-h-[6.5rem] flex-col justify-between p-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Quick action</div>
            <Link to="/wholesale/shop" className={`${WS_PRIMARY} mt-2 w-full justify-center sm:w-auto`}>
              Shop wholesale
            </Link>
          </Card>
        </div>

        {error ? (
          <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0">{error}</p>
            <Button
              type="button"
              variant="primary"
              className="shrink-0 sm:scale-100"
              onClick={() => {
                setError(null)
                setReloadKey((k) => k + 1)
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <Card className="overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-900">Order history</h2>
            <p className="mt-1 text-sm text-neutral-600">
              View details, line items, and reorder in one click.
            </p>
          </div>

          {loading ? (
            <div className="space-y-2 px-5 py-6" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-md bg-neutral-100" />
              ))}
            </div>
          ) : !hasOrders ? (
            <div className="px-5 py-10 text-center">
              <p className="text-base font-medium text-neutral-800">No wholesale orders yet</p>
              <p className="mt-2 text-sm text-neutral-600">
                Start by browsing products with your partner pricing. Completed checkouts will show up
                here with totals and status.
              </p>
              <Link to="/wholesale/shop" className={`${WS_PRIMARY} mt-6 px-6`}>
                Browse wholesale shop
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-100 text-left">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Order status</th>
                    <th className="px-5 py-3 font-medium">Payment status</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white text-sm text-neutral-700">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-neutral-900">{shortOrderId(o.id)}</div>
                        <div className="mt-1 font-mono text-[11px] text-neutral-400">{o.id}</div>
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{formatOrderDate(o.createdAt)}</td>
                      <td className="px-5 py-4 tabular-nums">{o.itemCount}</td>
                      <td className="px-5 py-4 font-medium text-neutral-900 tabular-nums">
                        {formatAud(Number.parseFloat(o.totalAmount))}
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/wholesale/orders/${o.id}`} className={WS_SECONDARY_SM}>
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
    </>
  )
}

