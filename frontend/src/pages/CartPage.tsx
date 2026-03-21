import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useCart } from '../features/cart/CartContext'
import { CartSummaryCard } from '../features/cart/components/CartSummaryCard'
import { QuantityControl } from '../features/cart/components/QuantityControl'
import { formatAud } from '../features/cart/money'
import { SHIPPING_CONFIG, calculateShipping } from '../features/cart/shippingRules'
import {
  formatShippingToPostcodeLine,
  isValidAuPostcode,
  qualifiesForFreeShipping,
} from '../features/cart/cartFreight'
import { Seo } from '../components/seo/Seo'
import { SmartImage } from '../components/media/SmartImage'

export function CartPage() {
  const { items, summary, incrementItem, decrementItem, removeItem, setItemQuantity, clearCart } =
    useCart()

  const [postcode, setPostcode] = useState('')
  const [appliedPostcode, setAppliedPostcode] = useState<string | null>(null)
  const [freightError, setFreightError] = useState<string | null>(null)

  const prevSubtotal = useRef(summary.subtotal)
  useEffect(() => {
    const prev = prevSubtotal.current
    const now = summary.subtotal
    const wasBelow = prev < SHIPPING_CONFIG.freeShippingThreshold
    const nowBelow = now < SHIPPING_CONFIG.freeShippingThreshold
    if (wasBelow !== nowBelow) {
      setAppliedPostcode(null)
      setFreightError(null)
    }
    prevSubtotal.current = now
  }, [summary.subtotal])

  const freeShipping = qualifiesForFreeShipping(summary.subtotal)
  const shippingResolved = freeShipping || appliedPostcode !== null
  const shippingAmount = shippingResolved ? calculateShipping(summary.subtotal) : 0
  const total = shippingResolved ? summary.subtotal + shippingAmount : summary.subtotal

  const successLine = freeShipping
    ? `Free shipping on orders ${formatAud(SHIPPING_CONFIG.freeShippingThreshold)} and over.`
    : appliedPostcode
      ? `${formatShippingToPostcodeLine(appliedPostcode, summary.subtotal)} (flat rate, Australia-wide demo estimate).`
      : null

  function handleCalculateShipping() {
    setFreightError(null)
    if (freeShipping) {
      setAppliedPostcode(null)
      return
    }
    if (!isValidAuPostcode(postcode)) {
      setFreightError('Enter a valid Australian postcode (4 digits).')
      setAppliedPostcode(null)
      return
    }
    setAppliedPostcode(postcode.trim())
  }

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <Seo
          title="Cart | By Celeste"
          description="Your shopping cart on By Celeste. Add products to see totals and continue to checkout."
        />
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Cart</h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-700">
            Your cart is currently empty. Explore the shop to add products.
          </p>
        </div>
        <Card>
          <p className="text-sm text-neutral-700">
            Add products to see item totals, shipping estimate, and checkout summary.
          </p>
          <div className="mt-4">
            <Link to="/shop">
              <Button type="button">Back to Shop</Button>
            </Link>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Seo
        title="Cart | By Celeste"
        description="Review your cart items on By Celeste. Update quantities, see totals, and proceed to secure checkout."
      />
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Cart</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-700">
          Review your items, estimate shipping with your postcode, then continue to checkout when
          you&apos;re ready.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Your items</h2>
            <Button type="button" variant="ghost" onClick={clearCart}>
              Clear cart
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity
              return (
                <div
                  key={item.productId}
                  className="grid gap-3 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[96px,1fr]"
                >
                  <SmartImage
                    src={item.imageUrl}
                    alt={item.name}
                    wrapperClassName="relative h-24 w-24 rounded-lg"
                    imgClassName="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-600">{formatAud(item.price)} each</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(item.productId)}
                        className="px-2 py-1 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <QuantityControl
                        quantity={item.quantity}
                        max={item.stockQuantity > 0 ? item.stockQuantity : 1}
                        onDecrease={() => decrementItem(item.productId)}
                        onIncrease={() => incrementItem(item.productId)}
                        onSet={(value) => setItemQuantity(item.productId, value)}
                      />
                      <p className="text-sm font-medium text-neutral-900">
                        Subtotal: {formatAud(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-neutral-900">Freight calculator</h3>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Australian orders: flat {formatAud(SHIPPING_CONFIG.standardFee)} shipping on orders
              under {formatAud(SHIPPING_CONFIG.freeShippingThreshold)}. Free shipping when your
              cart reaches {formatAud(SHIPPING_CONFIG.freeShippingThreshold)} or more (demo
              estimate).
            </p>

            {freeShipping ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-3 text-sm text-emerald-900">
                {successLine}
              </div>
            ) : (
              <>
                <p className="mt-3 text-xs font-medium text-neutral-800">
                  Enter your postcode to see shipping and your order total before checkout.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="cart-postcode" className="mb-1 block text-xs text-neutral-600">
                      Postcode (4 digits)
                    </label>
                    <input
                      id="cart-postcode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={4}
                      placeholder="e.g. 3000"
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))
                        setFreightError(null)
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <Button type="button" onClick={handleCalculateShipping} className="sm:shrink-0">
                    Calculate shipping
                  </Button>
                </div>
                {freightError ? (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                    {freightError}
                  </p>
                ) : null}
                {appliedPostcode && successLine ? (
                  <p className="mt-4 text-sm font-medium text-neutral-900">{successLine}</p>
                ) : null}
              </>
            )}
          </Card>
          <CartSummaryCard
            subtotal={summary.subtotal}
            shipping={shippingAmount}
            total={total}
            shippingResolved={shippingResolved}
            shippingSubLabel={shippingResolved ? successLine : null}
          />
        </div>
      </div>
    </section>
  )
}
