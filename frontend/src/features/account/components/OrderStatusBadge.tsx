const styles: Record<string, string> = {
  PENDING: 'bg-neutral-100 text-neutral-800',
  AWAITING_PAYMENT: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  PAID: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  PAYMENT_FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  CANCELLED: 'bg-neutral-100 text-neutral-600 line-through decoration-neutral-400',
}

export function OrderStatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-neutral-100 text-neutral-800'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
