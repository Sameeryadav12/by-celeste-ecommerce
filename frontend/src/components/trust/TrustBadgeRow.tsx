/**
 * Single row of trust signals — minimal outline icons, equal visual weight.
 * Used above the site footer (global).
 */

function IconAustralianMade({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21c-3-3-6-6.2-6-10a6 6 0 0 1 12 0c0 3.8-3 7-6 10Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

function IconNative({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21V10" />
      <path d="M12 14c-2.5-2-4-4.5-3.5-7 .5-2.5 2.5-3.5 4-2" />
      <path d="M12 15c2-1.5 3.5-3.5 3-6-.5-2.5-2.5-3-4-1.5" />
    </svg>
  )
}

function IconCrueltyFree({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21a7 7 0 0 0 7-7c0-4-3-7-7-7s-7 3-7 7a7 7 0 0 0 7 7Z" />
      <path d="M9 10h.01M15 10h.01" />
      <path d="M10 14c.8.8 2.2.8 3 0" />
    </svg>
  )
}

const iconClass = 'h-6 w-6 shrink-0 text-neutral-600'

const items = [
  { label: 'Australian Made', Icon: IconAustralianMade },
  { label: 'Native Ingredients', Icon: IconNative },
  { label: 'Cruelty-Free', Icon: IconCrueltyFree },
] as const

export function TrustBadgeRow() {
  return (
    <div
      className="border-t border-neutral-200 bg-white py-8 sm:py-10"
      role="region"
      aria-label="Brand trust and values"
    >
      <ul className="mx-auto flex max-w-3xl flex-col items-stretch justify-center gap-6 sm:flex-row sm:items-start sm:gap-0 sm:divide-x sm:divide-neutral-200">
        {items.map(({ label, Icon }) => (
          <li
            key={label}
            className="flex flex-1 flex-col items-center gap-2 px-4 text-center sm:px-8"
          >
            <Icon className={iconClass} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
