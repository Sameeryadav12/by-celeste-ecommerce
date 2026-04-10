import { useEffect, useMemo, useState } from 'react'
import { Seo } from '../../components/seo/Seo'
import { useAuth } from '../../auth/AuthContext'
import type { AuthUser } from '../../auth/authTypes'
import { Card } from '../../components/ui/Card'
import { fetchMyAccount } from '../../features/account/accountApi'

function statusTone(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
  if (status === 'PENDING') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-900 ring-1 ring-rose-200'
  return 'bg-neutral-100 text-neutral-800'
}

function statusCopy(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED') {
    return 'You have access to wholesale pricing and ordering.'
  }
  if (status === 'PENDING') {
    return 'Your application is under review. You will gain access once approved.'
  }
  if (status === 'REJECTED') {
    return 'Your application was not approved. Please contact support.'
  }
  return 'Your wholesale status is not set yet.'
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

function partnerBadge(user: AuthUser | null) {
  if (!user) return null
  if (user.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'APPROVED') {
    return (
      <span className="inline-flex rounded-full bg-neutral-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white">
        Approved wholesale partner
      </span>
    )
  }
  if (user.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'PENDING') {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-950 ring-1 ring-amber-200">
        Application pending
      </span>
    )
  }
  if (user.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'REJECTED') {
    return (
      <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-rose-950 ring-1 ring-rose-200">
        Application not approved
      </span>
    )
  }
  return null
}

function accountTypeLabel(user: AuthUser | null) {
  if (!user) return '—'
  if (user.role === 'CUSTOMER') return 'Retail customer'
  if (user.role === 'ADMIN') return 'Administrator'
  if (user.role === 'WHOLESALE') return 'Wholesale applicant / partner'
  return user.role
}

export function WholesaleAccountPage() {
  const { user: authUser } = useAuth()
  const [account, setAccount] = useState<AuthUser | null>(authUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchMyAccount()
        if (!cancelled) setAccount(res.user)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load account details right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const user = account ?? authUser
  const fullName = useMemo(
    () => (user ? `${user.firstName} ${user.lastName}`.trim() : '—'),
    [user],
  )

  if (!user && !loading) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error ?? 'Could not load wholesale account details.'}</p>
      </Card>
    )
  }

  return (
    <>
      <Seo
        title="Wholesale Account | By Celeste"
        description="View your wholesale account details and approval status."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Wholesale Dashboard
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Wholesale Account</h1>
            {partnerBadge(user)}
          </div>
          <p className="max-w-2xl text-sm leading-6 text-neutral-700">
            Review your account details, business information, and wholesale approval status.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Account info</h2>
            {loading ? (
              <p className="mt-3 text-sm text-neutral-600">Loading account info…</p>
            ) : (
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Full name</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Email</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{user?.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Account type</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{accountTypeLabel(user)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Contact</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{user?.email ?? '—'}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Approval status</h2>
            {loading ? (
              <p className="mt-3 text-sm text-neutral-600">Loading status…</p>
            ) : (
              <>
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone(user?.wholesaleApprovalStatus ?? 'NONE')}`}
                  >
                    {(user?.wholesaleApprovalStatus ?? 'NONE').replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  {statusCopy(user?.wholesaleApprovalStatus ?? 'NONE')}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  Approved at: {formatDate(user?.approvedAt ?? null)}
                </p>
              </>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Business details
          </h2>
          {loading ? (
            <p className="mt-3 text-sm text-neutral-600">Loading business details…</p>
          ) : (
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Business name
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">{user?.businessName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">ABN</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user?.abn ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Business contact
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">{user?.email ?? '—'}</dd>
              </div>
            </dl>
          )}
        </Card>
      </div>
    </>
  )
}

