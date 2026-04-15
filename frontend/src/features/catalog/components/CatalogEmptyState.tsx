import type { ReactNode } from 'react'

export function CatalogEmptyState({ message, actions }: { message: string; actions?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <p className="text-sm text-neutral-700">{message}</p>
      {actions ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  )
}

