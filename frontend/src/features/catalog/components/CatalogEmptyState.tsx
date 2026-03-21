export function CatalogEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
      <p className="text-sm text-neutral-700">{message}</p>
    </div>
  )
}

