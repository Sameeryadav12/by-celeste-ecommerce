import { WHOLESALE_MINIMUM_ORDER_SUMMARY } from '../../../features/wholesale/wholesaleOrderRules'

export function WholesalePricingNote() {
  return (
    <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800">
      Wholesale pricing is 50% off retail pricing. {WHOLESALE_MINIMUM_ORDER_SUMMARY}
    </p>
  )
}
