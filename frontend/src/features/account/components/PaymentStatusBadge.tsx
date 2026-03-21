const styles: Record<string, string> = {
  UNPAID: 'bg-neutral-100 text-neutral-700',
  PENDING: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  PAID: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  CANCELLED: 'bg-neutral-100 text-neutral-600',
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-neutral-100 text-neutral-700'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
