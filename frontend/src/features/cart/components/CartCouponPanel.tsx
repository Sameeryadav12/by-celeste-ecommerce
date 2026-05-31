import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { Button } from '../../../components/ui/Button'
import { useCart } from '../CartContext'
import { normaliseCouponCode, validateCoupon } from '../../discounts/discountsApi'

/** Cart coupon input. Lives next to the order summary on the cart page. */
export function CartCouponPanel() {
  const { user } = useAuth()
  const { summary, coupon, setCoupon, pricingMode } = useCart()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isWholesale =
    pricingMode === 'wholesale' ||
    (user?.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'APPROVED')

  async function handleApply(e: FormEvent) {
    e.preventDefault()
    const trimmed = normaliseCouponCode(code)
    if (!trimmed) {
      setError('Enter a coupon code first.')
      return
    }
    if (summary.subtotal <= 0) {
      setError('Add items to your cart before applying a coupon.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await validateCoupon({
        code: trimmed,
        subtotal: summary.subtotal,
        userEmail: user?.email,
        isWholesale,
      })
      setCoupon({ code: result.code, percentage: result.percentage })
      setCode('')
      setSuccessMessage(
        `Coupon ${result.code} applied — ${result.percentage}% off (-$${result.discountAmount}).`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRemove() {
    setCoupon(null)
    setSuccessMessage(null)
    setError(null)
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Discount coupon</h2>

      {coupon ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <span>
            <span className="font-mono font-semibold uppercase">{coupon.code}</span>{' '}
            applied · {coupon.percentage}% off subtotal
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-medium text-emerald-900 underline underline-offset-2 hover:text-emerald-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
            placeholder="Coupon code"
            spellCheck={false}
            autoCapitalize="characters"
            className="w-full flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <Button type="submit" disabled={submitting} className="shrink-0">
            {submitting ? 'Checking…' : 'Apply'}
          </Button>
        </form>
      )}

      {successMessage ? (
        <p className="mt-2 text-xs text-emerald-700">{successMessage}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        Discount applies to the cart subtotal before the flat $12 shipping fee.
      </p>
    </div>
  )
}
