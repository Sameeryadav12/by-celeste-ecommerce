import { useAuth } from '../../auth/AuthContext'

function StatusPill({ status }: { status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE' }) {
  const tone =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : status === 'REJECTED'
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-neutral-50 text-neutral-700 border-neutral-200'

  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', tone].join(' ')}>
      {status}
    </span>
  )
}

export function WholesaleDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Wholesale Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">
          This portal is a dedicated area for approved wholesale partners. It is separate from the
          customer website and the admin portal.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Account status</div>
              <div className="mt-1 text-sm text-neutral-600">
                Approval controls access to wholesale pricing and ordering tools.
              </div>
            </div>
            <StatusPill status={(user?.wholesaleApprovalStatus ?? 'NONE') as any} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">What you can do here</div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-neutral-700">
            <li>Browse the wholesale shop (placeholder)</li>
            <li>View wholesale orders (placeholder)</li>
            <li>Manage business details and status</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Recent orders</div>
          <p className="mt-2 text-sm text-neutral-600">Coming soon.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Quick stats</div>
          <p className="mt-2 text-sm text-neutral-600">Coming soon.</p>
        </div>
      </section>
    </div>
  )
}

