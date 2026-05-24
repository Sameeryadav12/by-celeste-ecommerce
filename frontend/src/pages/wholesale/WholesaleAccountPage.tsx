import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../../components/seo/Seo'
import { useAuth } from '../../auth/AuthContext'
import type { AuthUser } from '../../auth/authTypes'
import { Card } from '../../components/ui/Card'
import { fetchMyAccount, fetchMyOrders } from '../../features/account/accountApi'
import { AccountProfileEditor } from '../../features/account/components/AccountProfileEditor'
import { AccountPortalSummary } from '../../features/account/components/AccountPortalSummary'
import { WS_ACCT_PRIMARY, WS_ACCT_SECONDARY } from './wholesaleUi'

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

function wholesaleAccessMessage(user: AuthUser | null) {
  const status = user?.wholesaleApprovalStatus
  if (status === 'APPROVED') {
    return 'Your wholesale pricing and ordering are active. Shop, place bulk orders, and review history below.'
  }
  if (status === 'PENDING') {
    return 'Your application is under review. You can update your profile here; ordering opens once approved.'
  }
  if (status === 'REJECTED') {
    return 'Wholesale ordering is not available on this account. Contact support if you have questions.'
  }
  return 'Manage your wholesale profile and check your approval status here.'
}

export function WholesaleAccountPage() {
  const { user: authUser, refreshUser } = useAuth()
  const [account, setAccount] = useState<AuthUser | null>(authUser)
  const [orderCount, setOrderCount] = useState(0)
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
        const [accountRes, ordersRes] = await Promise.all([fetchMyAccount(), fetchMyOrders()])
        if (!cancelled) {
          setAccount(accountRes.user)
          setOrderCount(ordersRes.orders.length)
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
  const approved = user?.wholesaleApprovalStatus === 'APPROVED'

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

      <div className="space-y-6">
        <header className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-gradient-to-br from-neutral-50/90 via-white to-amber-50/20 px-5 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                Wholesale account
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Welcome back, {user?.firstName ?? 'there'}
              </h1>
              <div className="flex flex-wrap items-center gap-2">{partnerBadge(user)}</div>
              <p className="text-sm leading-relaxed text-neutral-600">{wholesaleAccessMessage(user)}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              {approved ? (
                <Link to="/wholesale/shop" className={`${WS_ACCT_PRIMARY} w-full justify-center sm:w-auto`}>
                  Shop wholesale
                </Link>
              ) : (
                <span
                  className={`${WS_ACCT_PRIMARY} w-full cursor-not-allowed justify-center opacity-45 sm:w-auto`}
                  aria-disabled
                >
                  Shop wholesale
                </span>
              )}
              <Link
                to="/wholesale/bulk-orders"
                className={`${WS_ACCT_SECONDARY} w-full justify-center sm:w-auto`}
              >
                Bulk orders
              </Link>
              <Link
                to="/wholesale/orders"
                className={`${WS_ACCT_SECONDARY} w-full justify-center sm:w-auto`}
              >
                My orders
              </Link>
            </div>
          </div>
        </header>

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

          <AccountPortalSummary
            mode="wholesale-summary"
            user={user}
            loading={loading}
            orderCount={orderCount}
          />
        </div>
      </div>
    </>
  )
}
