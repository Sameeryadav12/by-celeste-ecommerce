import { useCallback, useEffect, useState } from 'react'
import { Seo } from '../../components/seo/Seo'
import { useAuth } from '../../auth/AuthContext'
import type { AuthUser } from '../../auth/authTypes'
import { Card } from '../../components/ui/Card'
import { fetchMyAccount } from '../../features/account/accountApi'
import { AccountProfileEditor } from '../../features/account/components/AccountProfileEditor'
import { AccountPortalSummary } from '../../features/account/components/AccountPortalSummary'

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

export function WholesaleAccountPage() {
  const { user: authUser, refreshUser } = useAuth()
  const [account, setAccount] = useState<AuthUser | null>(authUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadAccount = useCallback(async () => {
    const res = await fetchMyAccount()
    setAccount(res.user)
    await refreshUser()
  }, [refreshUser])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchMyAccount()
        if (!cancelled) {
          setAccount(res.user)
          await refreshUser()
        }
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
  }, [refreshUser])

  const user = account ?? authUser

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

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            Wholesale Dashboard
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Wholesale Account</h1>
            {partnerBadge(user)}
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-neutral-500">
            View details here. Edit profile to update. Approval is read-only.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(248px,288px)] lg:items-start">
          <div>
            {loading ? (
              <p className="text-sm text-neutral-600">Loading…</p>
            ) : (
              <AccountProfileEditor variant="wholesale" layout="portal" onProfileSaved={reloadAccount} />
            )}
          </div>

          <AccountPortalSummary mode="wholesale-approval" user={user} loading={loading} />
        </div>
      </div>
    </>
  )
}
