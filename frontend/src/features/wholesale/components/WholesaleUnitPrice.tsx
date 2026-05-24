import type { CatalogProduct } from '../../catalog/catalogTypes'
import { formatAud } from '../../cart/money'
import { effectiveWholesaleUnit, retailUnitPrice } from '../wholesalePricing'

export function WholesaleUnitPrice({
  product,
  approved,
  compact = false,
  listStyle = false,
}: {
  product: CatalogProduct
  approved: boolean
  compact?: boolean
  /** Bulk list: "$7.50 each wholesale" + "RRP $15.00" on separate lines */
  listStyle?: boolean
}) {
  const unit = effectiveWholesaleUnit(product, approved)
  const rrp = retailUnitPrice(product, approved)

  if (!approved) {
    return <span className={compact ? 'text-sm font-medium' : 'text-base font-semibold'}>{formatAud(unit)}</span>
  }

  if (listStyle) {
    return (
      <div className="text-xs text-neutral-600">
        <span className="font-semibold text-neutral-900">{formatAud(unit)}</span>
        <span className="text-neutral-600"> each wholesale</span>
        <span className="mt-0.5 block text-neutral-500">RRP {formatAud(rrp)}</span>
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-0' : 'space-y-0.5'}>
      <div className={compact ? 'text-sm font-semibold text-neutral-900' : 'text-base font-semibold text-neutral-900'}>
        {formatAud(unit)}
        {compact ? <span className="ml-1 text-xs font-normal text-neutral-500">wholesale</span> : null}
      </div>
      {!compact ? (
        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-800">Wholesale</p>
      ) : null}
      <p className={`text-neutral-500 ${compact ? 'text-xs' : 'text-sm'}`}>RRP {formatAud(rrp)}</p>
    </div>
  )
}
