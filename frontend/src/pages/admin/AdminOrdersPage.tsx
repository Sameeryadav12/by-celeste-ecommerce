import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import {
  getAdminOrder,
  listAdminOrders,
  type AdminOrderDetail,
  type AdminOrderListRow,
} from '../../features/admin/adminApi'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminOrders(20)
      setOrders(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadDetail() {
      if (!selectedOrderId) return
      setDetailLoading(true)
      setError(null)
      try {
        const o = await getAdminOrder(selectedOrderId)
        if (!cancelled) setSelected(o)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load order detail.')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    void loadDetail()
    return () => {
      cancelled = true
    }
  }, [selectedOrderId])

  function formatCustomer(row: AdminOrderListRow) {
    return row.customer ? `${row.customer.firstName} ${row.customer.lastName}`.trim() : 'Customer'
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Orders</h2>
        <p className="text-sm text-neutral-600">View recent orders and payment status.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[340px,1fr]">
        <Card>
          <div className="space-y-1 p-4">
            <h3 className="text-base font-semibold text-neutral-900">Recent orders</h3>
            <p className="text-sm text-neutral-600">Click an order to view details.</p>
          </div>
          {loading ? (
            <div className="p-4 text-sm text-neutral-600">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-sm text-neutral-600">No orders found.</div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <li key={o.id} className="px-4 py-3">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedOrderId(o.id)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {formatCustomer(o)} · {o.customer.email}
                      </p>
                      <p className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString()}</p>
                      <div className="flex flex-wrap gap-2">
                        <AdminStatusBadge status={o.status} />
                        <AdminStatusBadge status={o.paymentStatus} />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">Total: {o.totalAmount}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="space-y-1 p-4">
            <h3 className="text-base font-semibold text-neutral-900">Order details</h3>
            <p className="text-sm text-neutral-600">Status, customer, shipping, and line items.</p>
          </div>

          {!selectedOrderId ? (
            <div className="p-4 text-sm text-neutral-600">Select an order from the list.</div>
          ) : detailLoading ? (
            <div className="p-4 text-sm text-neutral-600">Loading…</div>
          ) : selected ? (
            <div className="space-y-5 p-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {selected.customer.firstName} {selected.customer.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">{selected.customer.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge status={selected.status} />
                  <AdminStatusBadge status={selected.paymentStatus} />
                </div>
              </div>

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-neutral-600">Order placed</p>
                    <p className="font-medium text-neutral-900">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Order total</p>
                    <p className="font-medium text-neutral-900">${selected.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Shipping</p>
                    <p className="font-medium text-neutral-900">${selected.shippingAmount}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Subtotal</p>
                    <p className="font-medium text-neutral-900">${selected.subtotalAmount}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">Shipping address</p>
                <p className="text-sm text-neutral-700">
                  {selected.shipping.addressLine1}
                  {selected.shipping.addressLine2 ? `, ${selected.shipping.addressLine2}` : ''} · {selected.shipping.suburb} ·{' '}
                  {selected.shipping.state} {selected.shipping.postcode} · {selected.shipping.country}
                </p>
              </div>

              {selected.notes ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-900">Notes</p>
                  <p className="text-sm text-neutral-700">{selected.notes}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">Line items</p>
                <div className="overflow-auto rounded-md border border-neutral-200">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-100">
                        <th className="px-3 py-2 font-medium text-neutral-700">Product</th>
                        <th className="px-3 py-2 font-medium text-neutral-700">Qty</th>
                        <th className="px-3 py-2 font-medium text-neutral-700">Unit</th>
                        <th className="px-3 py-2 font-medium text-neutral-700">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it) => (
                        <tr key={it.id} className="border-t border-neutral-100">
                          <td className="px-3 py-2 text-neutral-900">{it.name}</td>
                          <td className="px-3 py-2 text-neutral-700">{it.quantity}</td>
                          <td className="px-3 py-2 text-neutral-700">${it.unitPrice}</td>
                          <td className="px-3 py-2 font-medium text-neutral-900">${it.lineTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-neutral-600">No order selected.</div>
          )}
        </Card>
      </div>
    </div>
  )
}

