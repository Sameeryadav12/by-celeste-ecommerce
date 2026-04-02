import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { useCart } from '../features/cart/CartContext'
import { CartSummaryCard } from '../features/cart/components/CartSummaryCard'
import { QuantityControl } from '../features/cart/components/QuantityControl'
import { formatAud } from '../features/cart/money'
import { SHIPPING_CONFIG, calculateShipping } from '../features/cart/shippingRules'
import { Seo } from '../components/seo/Seo'
import { SmartImage } from '../components/media/SmartImage'
import { getPublicBusinessSettings, type BusinessSettings } from '../features/content/contentApi'

export function CartPage() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null)
  const { items, summary, incrementItem, decrementItem, removeItem, setItemQuantity, clearCart } =
    useCart()

  const shippingAmount = calculateShipping(summary.subtotal)
  const total = summary.subtotal + shippingAmount

  useEffect(() => {
    let cancelled = false
    getPublicBusinessSettings()
      .then((data) => {
        if (!cancelled) setBusiness(data)
      })
      .catch(() => {
        if (!cancelled) setBusiness(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <Seo
          title="Cart | By Celeste"
          description="Your shopping cart on By Celeste. Add products to see totals and continue to checkout."
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your cart</h1>
          <p className="text-sm text-neutral-500">Your cart is empty.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-neutral-600">
            Looks like you haven&apos;t added anything yet.
          </p>
          <div className="mt-5">
            <Link to="/shop">
              <Button type="button">Browse products</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Seo
        title="Cart | By Celeste"
        description="Review your cart items on By Celeste. Update quantities, see totals, and proceed to secure checkout."
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your cart</h1>
          <p className="text-sm text-neutral-500">
            {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link
          to="/shop"
          className="text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-700"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* ── Item list ── */}
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5">
            <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-medium text-neutral-400 transition hover:text-red-600"
            >
              Clear all
            </button>
          </div>

          {items.map((item) => {
            const lineTotal = item.price * item.quantity

            return (
              <div key={item.productId} className="px-5 py-5">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link
                    to={`/shop/${item.slug}`}
                    className="shrink-0 overflow-hidden rounded-xl ring-1 ring-neutral-200/60 transition hover:ring-neutral-300"
                  >
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      wrapperClassName="relative h-20 w-20 sm:h-[92px] sm:w-[92px]"
                      imgClassName="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </Link>

                  {/* Content + controls */}
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
                    {/* Left: name, detail, actions */}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/shop/${item.slug}`}
                        className="text-sm font-semibold leading-snug text-neutral-900 hover:underline"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {item.categoryName ? (
                          <span className="text-xs text-neutral-500">{item.categoryName}</span>
                        ) : null}
                        {item.categoryName ? (
                          <span className="text-neutral-200" aria-hidden>&middot;</span>
                        ) : null}
                        <span className="text-xs text-neutral-500">{formatAud(item.price)} each</span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Link
                          to={`/shop/${item.slug}`}
                          className="text-[11px] font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-800 hover:decoration-neutral-500"
                        >
                          View product
                        </Link>
                        <span className="text-neutral-200" aria-hidden>&middot;</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 transition hover:text-red-600"
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden>
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118Z" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Right: quantity + line total */}
                    <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                      <QuantityControl
                        quantity={item.quantity}
                        max={item.stockQuantity > 0 ? item.stockQuantity : 1}
                        onDecrease={() => decrementItem(item.productId)}
                        onIncrease={() => incrementItem(item.productId)}
                        onSet={(value) => setItemQuantity(item.productId, value)}
                      />
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatAud(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <CartSummaryCard
            subtotal={summary.subtotal}
            shipping={shippingAmount}
            total={total}
            shippingSubLabel={`${business?.shippingMethodLabel || 'Flat rate shipping'} via ${business?.shippingCarrierWording || SHIPPING_CONFIG.carrierLabel}`}
            checkoutSupportNote={`Secure checkout powered by Square · ${business?.shippingExplanatoryNote || 'Flat rate shipping via Australia Post'}`}
          />
        </div>
      </div>
    </section>
  )
}
