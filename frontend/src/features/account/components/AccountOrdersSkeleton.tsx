export function AccountOrdersSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-lg bg-neutral-100" />
      ))}
    </div>
  )
}
