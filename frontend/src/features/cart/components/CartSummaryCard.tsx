import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { formatAud } from '../money'

export function CartSummaryCard({
  subtotal,
  shipping,
  total,
  shippingResolved = true,
  shippingSubLabel,
  ctaTo = '/checkout',
  ctaLabel = 'Continue to checkout',
  showCta = true,
  checkoutSupportNote = 'Secure checkout powered by Square · Flat rate shipping via Australia Post',
}: {
  subtotal: number
  shipping: number
  total: number
  shippingResolved?: boolean
  shippingSubLabel?: string | null
  ctaTo?: string
  ctaLabel?: string
  showCta?: boolean
  checkoutSupportNote?: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Order summary</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-neutral-600">
          <dt>Subtotal</dt>
          <dd>{formatAud(subtotal)}</dd>
        </div>

        <div className="space-y-0.5 text-neutral-600">
          <div className="flex items-center justify-between">
            <dt>Shipping</dt>
            <dd className="font-medium text-neutral-900">
              {shippingResolved ? (shipping === 0 ? 'Free' : formatAud(shipping)) : '—'}
            </dd>
          </div>
          {shippingSubLabel ? (
            <p className="text-xs text-neutral-400">{shippingSubLabel}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-base font-semibold text-neutral-900">
          <dt>Total</dt>
          <dd>{shippingResolved ? formatAud(total) : '—'}</dd>
        </div>
      </dl>

      {showCta ? (
        <div className="mt-5 space-y-3">
          <Link to={ctaTo} className="block">
            <Button type="button" className="w-full">
              {ctaLabel}
            </Button>
          </Link>
          <p className="text-center text-[11px] leading-relaxed text-neutral-400">
            {checkoutSupportNote}
          </p>
        </div>
      ) : null}
    </div>
  )
}
