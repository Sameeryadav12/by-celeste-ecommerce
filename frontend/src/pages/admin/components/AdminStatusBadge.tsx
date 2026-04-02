const styles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  VISIBLE: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  HIDDEN: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  PUBLISHED: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  UNPUBLISHED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  PENDING: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  SUSPENDED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
  FEATURED: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  STANDARD: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
  AWAITING_PAYMENT: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  PAID: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  PAYMENT_FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  CANCELLED: 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300',
  UNPAID: 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300',
}

export function AdminStatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-neutral-100 text-neutral-600'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

