import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { formatAud } from '../money'

export function CartSummaryCard({
  subtotal,
  shipping,
  total,
  shippingResolved = true,
  shippingSubLabel,
  ctaTo = '/checkout',
  ctaLabel = 'Continue to Checkout',
  showCta = true,
}: {
  subtotal: number
  /** When `shippingResolved` is false, this value is ignored for display (shows —). */
  shipping: number
  total: number
  /** When false, Shipping and Total show placeholders until freight is calculated. */
  shippingResolved?: boolean
  /** Optional note under the shipping row (e.g. postcode estimate line). */
  shippingSubLabel?: string | null
  ctaTo?: string
  ctaLabel?: string
  showCta?: boolean
}) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-neutral-900">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-neutral-700">
          <dt>Subtotal</dt>
          <dd>{formatAud(subtotal)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 text-neutral-700">
          <div className="flex items-center justify-between">
            <dt>Shipping</dt>
            <dd className="font-medium text-neutral-900">
              {shippingResolved ? (shipping === 0 ? 'Free' : formatAud(shipping)) : '—'}
            </dd>
          </div>
          {shippingSubLabel ? (
            <p className="text-xs leading-5 text-neutral-500">{shippingSubLabel}</p>
          ) : null}
          {!shippingResolved ? (
            <p className="text-xs leading-5 text-neutral-500">
              Enter a valid Australian postcode (4 digits) and tap Calculate shipping to see your
              total before checkout.
            </p>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
          <dt>Total</dt>
          <dd>{shippingResolved ? formatAud(total) : '—'}</dd>
        </div>
      </dl>
      {showCta ? (
        <div className="mt-4">
          {shippingResolved ? (
            <Link to={ctaTo} className="block">
              <Button type="button" className="w-full">
                {ctaLabel}
              </Button>
            </Link>
          ) : (
            <>
              <Button type="button" className="w-full" disabled>
                {ctaLabel}
              </Button>
              <p className="mt-2 text-center text-xs text-neutral-500">
                Calculate shipping above to continue.
              </p>
            </>
          )}
        </div>
      ) : null}
    </Card>
  )
}
