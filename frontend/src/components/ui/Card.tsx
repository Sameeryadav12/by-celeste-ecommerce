import type { ReactNode } from 'react'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        'rounded-xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

