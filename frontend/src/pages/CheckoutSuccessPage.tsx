import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { fetchOrderStatus, type OrderStatusResponse } from '../features/checkout/checkoutApi'
import { formatAud } from '../features/cart/money'

function statusMessage(data: OrderStatusResponse | null) {
  if (!data) return 'Checking your order…'
  if (data.paymentStatus === 'PAID') {
    return 'Payment received — thank you! Your order is confirmed on our system.'
  }
  if (data.paymentStatus === 'FAILED' || data.status === 'PAYMENT_FAILED') {
    return 'Payment did not complete. You can return to checkout and try again, or contact us if you need help.'
  }
  if (data.paymentStatus === 'CANCELLED' || data.status === 'CANCELLED') {
    return 'This checkout was cancelled before payment finished.'
  }
  return 'If you just paid, your bank may still be processing. This page refreshes automatically — the final confirmation always comes from our secure payment provider via webhook.'
}

export function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  const [data, setData] = useState<OrderStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('No order reference was found in the link. If you completed payment, check your email or contact us.')
      return
    }

    const resolvedOrderId = orderId
    let cancelled = false

    async function load() {
      try {
        const next = await fetchOrderStatus(resolvedOrderId)
        if (!cancelled) {
          setData(next)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load order status.')
        }
      }
    }

    void load()
    const pollIntervalId = window.setInterval(() => void load(), 5000)
    return () => {
      cancelled = true
      window.clearInterval(pollIntervalId)
    }
  }, [orderId])

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Checkout</h1>
        <p className="text-sm leading-6 text-neutral-700">
          Square hosted the payment page — card details were never stored on this website.
        </p>
      </div>

      <Card>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-900">{statusMessage(data)}</p>
            {data ? (
              <dl className="mt-4 space-y-2 text-sm text-neutral-700">
                <div className="flex justify-between">
                  <dt>Order reference</dt>
                  <dd className="font-mono text-xs text-neutral-600">{data.orderId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Payment status</dt>
                  <dd>{data.paymentStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Order status</dt>
                  <dd>{data.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Total</dt>
                  <dd>{formatAud(Number.parseFloat(data.totalAmount))}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Loading…</p>
            )}
          </>
        )}

        <div className="mt-6 rounded-md bg-neutral-50 px-3 py-2 text-xs leading-5 text-neutral-600">
          <strong className="font-medium text-neutral-800">Why this might say “pending”:</strong> the
          return link from Square is a helpful signal, but the reliable confirmation is when Square
          notifies our server (webhook). That is why this page can update a few seconds after you pay.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/shop">
            <Button type="button">Continue shopping</Button>
          </Link>
          <Link to="/checkout/cancel" className="text-sm text-neutral-600 underline-offset-2 hover:underline">
            Payment issues?
          </Link>
        </div>
      </Card>
    </section>
  )
}
