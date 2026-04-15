import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '../../../auth/authTypes'
import { WS_ACCOUNT_CARD } from '../../../pages/wholesale/wholesaleUi'

type Mode = 'wholesale-approval' | 'customer-summary'

function ApprovalCardIcon({ status }: { status: AuthUser['wholesaleApprovalStatus'] }) {
  const wrap =
    status === 'APPROVED'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'PENDING'
        ? 'bg-amber-100 text-amber-800'
        : status === 'REJECTED'
          ? 'bg-rose-100 text-rose-800'
          : 'bg-neutral-100 text-neutral-600'
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${wrap}`}
      aria-hidden
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    </div>
  )
}

function approvalBadgeTone(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED')
    return 'bg-emerald-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm ring-1 ring-emerald-950/30'
  if (status === 'PENDING') return 'bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-950 ring-1 ring-amber-200/80'
  if (status === 'REJECTED') return 'bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-950 ring-1 ring-rose-200/80'
  return 'bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-700 ring-1 ring-neutral-200/80'
}

function approvalBadgeLabel(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED') return 'Approved'
  if (status === 'PENDING') return 'Pending review'
  if (status === 'REJECTED') return 'Not approved'
  return 'Not set'
}

function approvalBadgeDisplay(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED') return 'APPROVED'
  return approvalBadgeLabel(status)
}

function statusCopyShort(status: AuthUser['wholesaleApprovalStatus']) {
  if (status === 'APPROVED') return 'Wholesale pricing and ordering are active.'
  if (status === 'PENDING') return 'Application under review. We will notify you.'
  if (status === 'REJECTED') return 'Not approved. Contact support if needed.'
  return 'Wholesale status not set.'
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

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-neutral-100 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="w-[38%] shrink-0 text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-right text-[13px] font-semibold leading-snug tracking-tight text-neutral-950">
        {children}
      </div>
    </div>
  )
}

function CustomerSummaryIcon() {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600"
      aria-hidden
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </div>
  )
}

export type AccountPortalSummaryProps = {
  mode: Mode
  user: AuthUser | null
  loading?: boolean
  orderCount?: number
  loyaltyBalance?: number
}

export function AccountPortalSummary({
  mode,
  user,
  loading,
  orderCount = 0,
  loyaltyBalance = 0,
}: AccountPortalSummaryProps) {
  if (mode === 'wholesale-approval') {
    const status = user?.wholesaleApprovalStatus ?? 'NONE'
    return (
      <div className={WS_ACCOUNT_CARD}>
        <div className="mb-3 flex items-center gap-3 border-b border-neutral-100 pb-3">
          <ApprovalCardIcon status={status} />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Approval</h2>
        </div>
        {loading ? (
          <p className="text-sm text-neutral-600">Loading…</p>
        ) : (
          <div className="space-y-2.5">
            <div>
              <span className={`inline-flex rounded-full ${approvalBadgeTone(status)}`}>
                {approvalBadgeDisplay(status)}
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-neutral-500">{statusCopyShort(status)}</p>
            <p className="border-t border-neutral-100 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Approved · {formatDate(user?.approvedAt ?? null)}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={WS_ACCOUNT_CARD}>
      <div className="mb-3 flex items-center gap-3 border-b border-neutral-100 pb-3">
        <CustomerSummaryIcon />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Summary</h2>
      </div>
      {loading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <div>
          <SummaryRow label="Account">
            <span className="text-neutral-950">Customer</span>
          </SummaryRow>
          <SummaryRow label="Loyalty">
            <a
              href="#account-loyalty"
              className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-950"
            >
              {loyaltyBalance} pts
            </a>
          </SummaryRow>
          <SummaryRow label="Orders">
            {orderCount === 0 ? (
              <span className="font-medium text-neutral-500">None yet</span>
            ) : (
              <a
                href="#account-orders"
                className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-950"
              >
                {orderCount} {orderCount === 1 ? 'order' : 'orders'}
              </a>
            )}
          </SummaryRow>
          <p className="border-t border-neutral-100 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            <Link to="/shop" className="text-neutral-500 transition hover:text-neutral-800">
              Shop
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
