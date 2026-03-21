import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../auth/authTypes'
import {
  fetchMyLoyalty,
  fetchMyOrders,
  type AccountOrderSummary,
  type LoyaltyDashboard,
} from '../features/account/accountApi'
import { OrderStatusBadge } from '../features/account/components/OrderStatusBadge'
import { PaymentStatusBadge } from '../features/account/components/PaymentStatusBadge'
import { AccountOrdersSkeleton } from '../features/account/components/AccountOrdersSkeleton'
import { formatAud } from '../features/cart/money'

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function roleLabel(role: Role): string {
  switch (role) {
    case 'WHOLESALE':
      return 'Wholesale'
    case 'ADMIN':
      return 'Admin'
    default:
      return 'Customer'
  }
}

/** Subtle tier hint for loyalty card only — not a formal rewards program API. */
function loyaltyTierAccent(balance: number) {
  if (balance >= 500) {
    return {
      label: 'Luminous',
      blurb: 'Thank you for shopping with us — your points reflect every thoughtful purchase.',
      fill: Math.min(100, 55 + (balance % 450) / 4.5),
    }
  }
  if (balance >= 150) {
    return {
      label: 'Radiance',
      blurb: 'Your balance grows with each completed order. Points apply after payment is confirmed.',
      fill: Math.min(100, 25 + ((balance - 150) / 350) * 35),
    }
  }
  return {
    label: 'Foundation',
    blurb: 'Earn points on qualifying purchases. They appear here once your order is paid and complete.',
    fill: Math.min(100, (balance / 150) * 25),
  }
}

const cardShell =
  'flex h-full flex-col rounded-2xl border border-neutral-200/70 bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-6'

const primaryLinkClasses =
  'inline-flex items-center justify-center rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

export function AccountDashboardPage() {
  const { user, logout, refreshUser } = useAuth()
  const [orders, setOrders] = useState<AccountOrderSummary[] | null>(null)
  const [loyalty, setLoyalty] = useState<LoyaltyDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        await refreshUser()
        const [ordersRes, loyaltyRes] = await Promise.all([fetchMyOrders(), fetchMyLoyalty()])
        if (!cancelled) {
          setOrders(ordersRes.orders)
          setLoyalty(loyaltyRes)
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'We could not load your account. You may need to sign in again.',
          )
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

  async function handleLogout() {
    await logout()
    window.location.assign('/login')
  }

  if (!user) {
    return null
  }

  const displayBalance = loyalty?.balance ?? user.loyaltyPointsBalance ?? 0
  const orderCount = orders?.length ?? 0
  const tier = loyaltyTierAccent(displayBalance)

  const pointsCopy =
    loyalty?.howPointsAreEarned ??
    'Points are added after payment is confirmed — not while items are only in your cart.'

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* —— Header —— */}
      <header
        id="account-overview"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-neutral-200/60 bg-gradient-to-br from-neutral-50/90 via-white to-amber-50/20 px-5 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8 sm:py-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Your account
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              Here you can review your profile, see orders placed while signed in, and track the loyalty
              you&apos;ve earned with By Celeste.
            </p>
          </div>

          <div className="flex w-full max-w-md flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-3">
            <Link to="/shop" className={`${primaryLinkClasses} w-full justify-center sm:w-auto`}>
              Browse products
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-neutral-200/60 bg-white/60 px-3 py-2 text-center text-sm font-medium text-neutral-500 transition hover:border-neutral-300 hover:bg-white hover:text-neutral-800 sm:w-auto sm:border-0 sm:bg-transparent sm:px-3"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Section nav */}
        <nav
          className="mt-6 flex flex-wrap gap-2 border-t border-neutral-200/50 pt-5"
          aria-label="Account sections"
        >
          <a
            href="#account-overview"
            className="rounded-full border border-neutral-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:text-neutral-900"
          >
            Overview
          </a>
          <a
            href="#account-orders"
            className="rounded-full border border-transparent bg-transparent px-3.5 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-white/60 hover:text-neutral-800"
          >
            Orders
          </a>
          <a
            href="#account-loyalty"
            className="rounded-full border border-transparent bg-transparent px-3.5 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-white/60 hover:text-neutral-800"
          >
            Loyalty
          </a>
        </nav>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* —— Summary cards —— */}
      <section aria-labelledby="account-summary-heading" className="space-y-4">
        <h2 id="account-summary-heading" className="sr-only">
          Account summary
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {/* Profile */}
          <div className={cardShell}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Profile
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-900">Your details</p>
            <dl className="mt-5 flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-1 border-b border-neutral-100 pb-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-xs font-medium text-neutral-400">Name</dt>
                <dd className="text-sm font-medium text-neutral-900">
                  {user.firstName} {user.lastName}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 border-b border-neutral-100 pb-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-xs font-medium text-neutral-400">Email</dt>
                <dd className="break-all text-sm font-medium text-neutral-900">{user.email}</dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-xs font-medium text-neutral-400">Account type</dt>
                <dd className="text-sm font-medium text-neutral-900">{roleLabel(user.role)}</dd>
              </div>
            </dl>
          </div>

          {/* Loyalty */}
          <div
            id="account-loyalty"
            className={`${cardShell} scroll-mt-24 border-emerald-200/50 bg-gradient-to-b from-white via-white to-emerald-50/35 ring-1 ring-emerald-100/60`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800/70">
                  Loyalty
                </h3>
                <p className="mt-1 text-sm font-medium text-neutral-900">Your rewards balance</p>
              </div>
              <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                {tier.label}
              </span>
            </div>

            <p className="mt-6 font-serif text-4xl font-semibold tracking-tight text-emerald-950 tabular-nums sm:text-5xl">
              {displayBalance}
              <span className="ml-1.5 align-top font-sans text-sm font-medium text-emerald-800/80">
                pts
              </span>
            </p>

            <div className="mt-4">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-emerald-100/80"
                role="presentation"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400/90 to-emerald-600/80"
                  style={{ width: `${tier.fill}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-emerald-900/70">A quiet nod to how far you&apos;ve come</p>
            </div>

            <p className="mt-5 flex-1 text-sm leading-relaxed text-neutral-600">{tier.blurb}</p>
            <p className="mt-4 border-t border-emerald-100/80 pt-4 text-xs leading-relaxed text-neutral-500">
              {pointsCopy}
            </p>

            {loyalty && loyalty.recentTransactions.length > 0 ? (
              <ul className="mt-4 space-y-2.5 border-t border-emerald-100/80 pt-4 text-xs text-neutral-600">
                {loyalty.recentTransactions.slice(0, 4).map((t) => (
                  <li key={t.id} className="flex justify-between gap-2">
                    <span className="line-clamp-2 text-neutral-600">{t.description}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-emerald-900">
                      {t.pointsChange > 0 ? `+${t.pointsChange}` : t.pointsChange}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Order summary */}
          <div className={`${cardShell} md:col-span-2 lg:col-span-1`}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Orders
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-900">At a glance</p>
            <div className="mt-6 flex flex-1 flex-col">
              <p className="font-serif text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums sm:text-5xl">
                {loading ? '—' : orderCount}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {loading
                  ? 'Loading your order history…'
                  : orderCount === 0
                    ? 'No orders on this account yet'
                    : orderCount === 1
                      ? '1 order on this account'
                      : `${orderCount} orders on this account`}
              </p>
              {!loading && orderCount === 0 ? (
                <p className="mt-4 rounded-xl bg-neutral-50/80 px-3 py-3 text-sm leading-relaxed text-neutral-600 ring-1 ring-neutral-100">
                  When you check out while signed in, your completed purchases will show up here — a
                  simple record of your By Celeste favourites.
                </p>
              ) : null}
              {!loading && orderCount > 0 ? (
                <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                  Recent activity is listed below. Tap an order for full details.
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
              <a
                href="#account-orders"
                className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                {orderCount > 0 ? 'View orders' : 'Where orders appear'}
              </a>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-200/90 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Start shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale */}
      {user.role === 'WHOLESALE' ? (
        <section className="rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Wholesale
          </h2>
          <p className="mt-2 text-lg font-medium text-neutral-900">Your business access</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200/60 bg-white/80 px-4 py-3">
              <dt className="text-xs font-medium text-neutral-400">Business</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-900">{user.businessName ?? '—'}</dd>
            </div>
            <div className="rounded-xl border border-neutral-200/60 bg-white/80 px-4 py-3">
              <dt className="text-xs font-medium text-neutral-400">Approval status</dt>
              <dd className="mt-1 text-sm font-semibold tracking-wide text-neutral-900">
                {user.wholesaleApprovalStatus === 'APPROVED'
                  ? 'Approved'
                  : user.wholesaleApprovalStatus === 'PENDING'
                    ? 'Pending review'
                    : user.wholesaleApprovalStatus === 'REJECTED'
                      ? 'Not approved'
                      : user.wholesaleApprovalStatus === 'NONE'
                        ? '—'
                        : user.wholesaleApprovalStatus}
              </dd>
            </div>
          </dl>
          {user.wholesaleApprovalStatus === 'APPROVED' ? (
            <p className="mt-4 text-sm leading-relaxed text-emerald-900">
              Your account is approved. Where wholesale prices are set, you&apos;ll see them on product
              pages and at checkout — totals are always confirmed on our server.
            </p>
          ) : null}
          {user.wholesaleApprovalStatus === 'PENDING' ? (
            <p className="mt-4 text-sm leading-relaxed text-neutral-700">
              Your application is <span className="font-medium text-neutral-900">under review</span>.
              Until then, you&apos;ll see the same retail prices as other visitors.
            </p>
          ) : null}
          {user.wholesaleApprovalStatus === 'REJECTED' ? (
            <p className="mt-4 text-sm leading-relaxed text-amber-900">
              This wholesale application wasn&apos;t approved. You can still shop at retail prices, or
              reach out if you think we should take another look.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Recent orders */}
      <section
        id="account-orders"
        className="scroll-mt-24 space-y-5 rounded-2xl border border-neutral-200/70 bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
        aria-labelledby="recent-orders-heading"
      >
        <div className="flex flex-col gap-2 border-b border-neutral-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="recent-orders-heading"
              className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl"
            >
              Recent orders
            </h2>
            <p className="mt-1 max-w-xl text-sm text-neutral-500">
              Orders placed while you were signed in to this account.
            </p>
          </div>
          {orderCount > 0 && !loading ? (
            <Link
              to="/shop"
              className="text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-900"
            >
              Browse more products
            </Link>
          ) : null}
        </div>

        {loading ? (
          <AccountOrdersSkeleton />
        ) : orders && orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/40 px-6 py-12 text-center">
            <p className="max-w-md text-base font-medium text-neutral-800">No orders yet</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
              When you&apos;re ready, explore the shop — your first order will appear here after checkout,
              so everything stays in one calm place.
            </p>
            <Link to="/shop" className={`${primaryLinkClasses} mt-8 px-8`}>
              Start shopping
            </Link>
            <p className="mt-4 text-xs text-neutral-500">Free to browse; checkout when it suits you.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {orders?.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-4 py-5 first:pt-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <p className="font-mono text-[11px] text-neutral-400">{o.id}</p>
                  <p className="text-sm text-neutral-800">{formatOrderDate(o.createdAt)}</p>
                  <div className="flex flex-wrap gap-2">
                    <OrderStatusBadge status={o.status} />
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <p className="text-base font-semibold tabular-nums text-neutral-900">
                    {formatAud(Number.parseFloat(o.totalAmount))}
                  </p>
                  <Link to={`/account/orders/${o.id}`}>
                    <span className="inline-flex rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50">
                      View details
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
