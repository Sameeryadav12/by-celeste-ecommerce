import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Seo } from '../../components/seo/Seo'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { fetchMyOrder, type AccountOrderDetail } from '../../features/account/accountApi'
import { OrderStatusBadge } from '../../features/account/components/OrderStatusBadge'
import { PaymentStatusBadge } from '../../features/account/components/PaymentStatusBadge'
import { formatAud } from '../../features/cart/money'
import { useCart } from '../../features/cart/CartContext'
import { getProductBySlug } from '../../features/catalog/catalogApi'

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'full', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

function shortOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

export function WholesaleOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [order, setOrder] = useState<AccountOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reordering, setReordering] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Missing order reference.')
      setLoading(false)
      return
    }
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
  }, [id])

  const itemCount = useMemo(() => order?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0, [order])

  async function handleReorder() {
    if (!order) return
    setReordering(true)
    setReorderError(null)
    try {
      const results = await Promise.allSettled(order.items.map((i) => getProductBySlug(i.slug)))
      const failures = results.filter((r) => r.status === 'rejected').length

      results.forEach((res, index) => {
        if (res.status !== 'fulfilled') return
        const p = res.value
        const line = order.items[index]

        addItem({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          imageUrl: p.imageUrl,
          price: p.price, // viewer-based (wholesale when approved)
          compareAtPrice: p.compareAtPrice,
          stockQuantity: p.stockQuantity,
          categoryName: p.categories[0]?.name,
          shortDescription: p.shortDescription,
          quantity: line.quantity,
        })
      })

      if (failures > 0) {
        setReorderError(
          `${failures} item(s) could not be added (may be unavailable). The rest were added to your cart.`,
        )
      }

      navigate('/cart')
    } catch (e) {
      setReorderError(e instanceof Error ? e.message : 'Could not reorder right now.')
    } finally {
      setReordering(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy>
        <div className="h-8 w-64 rounded bg-neutral-100" />
        <div className="h-40 rounded-xl bg-neutral-100" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error ?? 'Order not found.'}</p>
        <Link to="/wholesale/orders" className="mt-4 inline-block">
          <Button type="button" variant="ghost">
            Back to orders
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <>
      <Seo
        title={`Wholesale Order ${shortOrderId(order.id)} | By Celeste`}
        description="Wholesale order details and reorder."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/wholesale/orders"
              className="text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              ← Back to orders
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              Order {shortOrderId(order.id)}
            </h1>
            <p className="mt-1 font-mono text-xs text-neutral-500">{order.id}</p>
            <p className="mt-1 text-sm text-neutral-600">{formatOrderDate(order.createdAt)}</p>
            <p className="mt-1 text-sm text-neutral-600">{itemCount} item(s)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <Button type="button" onClick={handleReorder} disabled={reordering}>
              {reordering ? 'Reordering…' : 'Reorder'}
            </Button>
          </div>
        </div>

        {reorderError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {reorderError}
          </div>
        ) : null}

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
                  {Number.parseFloat(order.shippingAmount) === 0 ? 'Free' : formatAud(Number.parseFloat(order.shippingAmount))}
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
          <p className="mt-1 text-xs text-neutral-500">
            Line pricing reflects the unit price used at the time of checkout (wholesale when approved).
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Qty</th>
                  <th className="pb-2 pr-4 font-medium">Wholesale price</th>
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
    </>
  )
}

