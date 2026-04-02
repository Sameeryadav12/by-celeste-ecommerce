/**
 * Single row of trust signals — client-provided icons, equal visual weight.
 * Used above the site footer (global).
 * Icons load from /icons/; if missing the badge falls back to text-only.
 */

import { BrandIcon } from '../icons/BrandIcon'

const items = [
  { label: 'Australian Made', icon: 'australian-made' },
  { label: 'Native Ingredients', icon: 'native-ingredients' },
  { label: 'Cruelty-Free', icon: 'cruelty-free' },
] as const

export function TrustBadgeRow({
  heading = 'Trusted by our community',
}: {
  heading?: string
}) {
  return (
    <div
      className="border-t border-neutral-200 bg-white py-8 sm:py-10"
      role="region"
      aria-label="Brand trust and values"
    >
      <div className="mx-auto max-w-3xl">
        {heading ? (
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {heading}
          </p>
        ) : null}
      <ul className="mx-auto flex max-w-3xl flex-col items-stretch justify-center gap-6 sm:flex-row sm:items-start sm:gap-0 sm:divide-x sm:divide-neutral-200">
        {items.map(({ label, icon }) => (
          <li
            key={label}
            className="flex flex-1 flex-col items-center gap-2.5 px-4 text-center sm:px-8"
          >
            <BrandIcon name={icon} className="h-7 w-7 text-neutral-600" alt={label} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800">
              {label}
            </span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}
