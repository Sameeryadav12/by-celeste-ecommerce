export function ProductPrice({
  price,
  compareAtPrice,
  retailUnitPrice,
  isWholesalePrice,
}: {
  price: number
  compareAtPrice?: number | null
  /** Public retail unit when viewer pays a wholesale unit price. */
  retailUnitPrice?: number
  isWholesalePrice?: boolean
}) {
  const priceText = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(price)

  const compareText =
    compareAtPrice != null
      ? new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(compareAtPrice)
      : null

  const retailRefText =
    retailUnitPrice != null
      ? new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(retailUnitPrice)
      : null

  return (
    <div className="space-y-1">
      {isWholesalePrice ? (
        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-800">
          Wholesale price
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-neutral-900">{priceText}</span>
        {compareText ? (
          <span className="text-sm text-neutral-500 line-through">{compareText}</span>
        ) : null}
      </div>
      {isWholesalePrice && retailRefText ? (
        <p className="text-xs text-neutral-500">Retail reference: {retailRefText}</p>
      ) : null}
    </div>
  )
}
