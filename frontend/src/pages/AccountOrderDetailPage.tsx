import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { fetchMyOrder, type AccountOrderDetail } from '../features/account/accountApi'
import { OrderStatusBadge } from '../features/account/components/OrderStatusBadge'
import { PaymentStatusBadge } from '../features/account/components/PaymentStatusBadge'
import { formatAud } from '../features/cart/money'

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function AccountOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<AccountOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('Missing order reference.')
      setLoading(false)
      return
    }
    const id = orderId
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchMyOrder(id)
        if (!cancelled) setOrder(res.order)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'We could not load this order. It may not be on your account.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy>
        <div className="h-8 w-48 rounded bg-neutral-100" />
        <div className="h-40 rounded-xl bg-neutral-100" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error ?? 'Order not found.'}</p>
        <Link to="/account" className="mt-4 inline-block">
          <Button type="button" variant="ghost">
            Back to account
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/account"
            className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            ← Back to account
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">Order details</h1>
          <p className="mt-1 font-mono text-xs text-neutral-500">{order.id}</p>
          <p className="mt-1 text-sm text-neutral-600">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Delivery</h2>
          <address className="mt-3 text-sm not-italic leading-6 text-neutral-700">
            {order.customer.firstName} {order.customer.lastName}
            <br />
            {order.shipping.addressLine1}
            <br />
            {order.shipping.addressLine2 ? (
              <>
                {order.shipping.addressLine2}
                <br />
              </>
            ) : null}
            {order.shipping.suburb} {order.shipping.state} {order.shipping.postcode}
            <br />
            {order.shipping.country}
            <br />
            <span className="text-neutral-500">Phone:</span> {order.customer.phone}
            <br />
            <span className="text-neutral-500">Email:</span> {order.customer.email}
          </address>
          {order.notes ? (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</h3>
              <p className="mt-1 text-sm text-neutral-700">{order.notes}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Totals</h2>
          <dl className="mt-3 space-y-2 text-sm text-neutral-700">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatAud(Number.parseFloat(order.subtotalAmount))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>
                {Number.parseFloat(order.shippingAmount) === 0
                  ? 'Free'
                  : formatAud(Number.parseFloat(order.shippingAmount))}
              </dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
              <dt>Total</dt>
              <dd>{formatAud(Number.parseFloat(order.totalAmount))}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Qty</th>
                <th className="pb-2 pr-4 font-medium">Price</th>
                <th className="pb-2 font-medium">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4 text-neutral-800">
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-neutral-500">{item.slug}</p>
                  </td>
                  <td className="py-3 pr-4">{item.quantity}</td>
                  <td className="py-3 pr-4">{formatAud(Number.parseFloat(item.unitPrice))}</td>
                  <td className="py-3 font-medium text-neutral-900">
                    {formatAud(Number.parseFloat(item.lineTotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
