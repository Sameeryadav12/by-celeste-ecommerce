import { formatAud } from '../../cart/money'
import {
  WHOLESALE_MINIMUM_ORDER_MESSAGE,
  WHOLESALE_MINIMUM_ORDER_SUMMARY,
  evaluateWholesaleMinimum,
  wholesaleMinimumStatusMessage,
} from '../wholesaleOrderRules'

export function WholesaleMinimumOrderNote({
  isApprovedWholesale,
  productSubtotal,
  showSubtotal = false,
}: {
  isApprovedWholesale: boolean
  productSubtotal: number
  showSubtotal?: boolean
}) {
  const status = evaluateWholesaleMinimum({ isApprovedWholesale, productSubtotal })
  if (!status.applies) return null

  const tone = status.meetsMinimum
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-amber-200 bg-amber-50 text-amber-950'

  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${tone}`}>
      <p>{WHOLESALE_MINIMUM_ORDER_SUMMARY}</p>
      {showSubtotal ? (
        <p className="mt-1 tabular-nums">
          Current wholesale subtotal: {formatAud(status.productSubtotal)}
        </p>
      ) : null}
      <p className="mt-1 font-medium">{wholesaleMinimumStatusMessage(status)}</p>
      {!status.meetsMinimum ? (
        <p className="mt-1 text-xs opacity-90">{WHOLESALE_MINIMUM_ORDER_MESSAGE}</p>
      ) : null}
    </div>
  )
}
