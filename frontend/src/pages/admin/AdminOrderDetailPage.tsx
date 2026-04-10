import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  getAdminOrder,
  updateAdminOrderStatus,
  type AdminOrderDetail,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

const ORDER_STATUSES = ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'CANCELLED'] as const

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusDraft, setStatusDraft] = useState<string>('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const orderId = id
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAdminOrder(orderId)
        if (cancelled) return
        setOrder(data)
        setStatusDraft(data.status)
      } catch (e) {
        if (!cancelled) setError('Could not load order details.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  const canSaveStatus = useMemo(() => !!order && statusDraft !== order.status, [order, statusDraft])

  async function handleSaveStatus() {
    if (!id || !order) return
    setSavingStatus(true)
    setError(null)
    setStatusMessage(null)
    try {
      const updated = await updateAdminOrderStatus(id, statusDraft)
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status,
              paymentStatus: updated.paymentStatus,
              updatedAt: updated.updatedAt,
            }
          : prev,
      )
      setStatusMessage('Order status updated successfully.')
    } catch (e) {
      setError('Could not update order status.')
    } finally {
      setSavingStatus(false)
    }
  }

  if (!id) {
    return <p className="text-sm text-red-700">Order ID is missing.</p>
  }

  if (loading) return <p className="text-sm text-slate-500">Loading order details...</p>
  if (error && !order) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        <Link
          to="/admin/orders"
          className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Back to orders
        </Link>
      </div>
    )
  }
  if (!order) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Order details</h1>
          <p className="mt-1 text-sm text-slate-500">Review customer, shipping, item, and payment information.</p>
        </div>
        <Link
          to="/admin/orders"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Back to orders
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {statusMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <Summary label="Order ID" value={order.id} />
            <Summary label="Created" value={new Date(order.createdAt).toLocaleString()} />
            <Summary label="Updated" value={new Date(order.updatedAt).toLocaleString()} />
            <Summary label="Order total" value={formatCurrency(order.totalAmount)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminStatusBadge status={order.status} />
            <AdminStatusBadge status={order.paymentStatus} />
          </div>
          {order.squareOrderId || order.payment?.providerReference ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Payment provider:</span>{' '}
                {order.payment?.provider ?? 'Square'}
              </p>
              {order.squareOrderId ? (
                <p>
                  <span className="font-semibold text-slate-800">Square order ID:</span>{' '}
                  {order.squareOrderId}
                </p>
              ) : null}
              {order.payment?.providerReference ? (
                <p>
                  <span className="font-semibold text-slate-800">Provider reference:</span>{' '}
                  {order.payment.providerReference}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Update order status</h2>
          <p className="mt-1 text-xs text-slate-500">Use existing backend order status values only.</p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-800">Order status</label>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <Button type="button" onClick={handleSaveStatus} disabled={!canSaveStatus || savingStatus}>
              {savingStatus ? 'Saving...' : 'Save status'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Customer details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Summary label="Name" value={`${order.customer.firstName} ${order.customer.lastName}`} />
            <Summary label="Email" value={order.customer.email} />
            <Summary label="Phone" value={order.customer.phone || '—'} />
          </dl>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Shipping details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Summary
              label="Address"
              value={`${order.shipping.addressLine1}${order.shipping.addressLine2 ? `, ${order.shipping.addressLine2}` : ''}, ${order.shipping.suburb}, ${order.shipping.state} ${order.shipping.postcode}, ${order.shipping.country}`}
            />
            <Summary label="Shipping method" value="Australia Post (standard)" />
            <Summary label="Shipping amount" value={formatCurrency(order.shippingAmount)} />
          </dl>
        </Card>
      </div>

      {order.notes ? (
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Notes</h2>
          <p className="mt-2 text-sm text-slate-700">{order.notes}</p>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Line items</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Unit price</th>
                <th className="px-3 py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.slug}</p>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
                  <td className="px-3 py-2 text-slate-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
              <tr>
                <td className="px-3 py-2 text-slate-600" colSpan={3}>
                  Subtotal
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{formatCurrency(order.subtotalAmount)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-600" colSpan={3}>
                  Shipping
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{formatCurrency(order.shippingAmount)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-semibold" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  )
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
