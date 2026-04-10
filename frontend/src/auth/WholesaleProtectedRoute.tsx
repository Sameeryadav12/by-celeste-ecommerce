import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function WholesaleProtectedRoute() {
  const { status, user } = useAuth()
  const location = useLocation()
  const isAccountPath = location.pathname === '/wholesale/account'

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-600">
        Checking your wholesale access…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  // Retail account that has never applied — portal is not for them yet
  if (user.role === 'CUSTOMER' && user.wholesaleApprovalStatus === 'NONE') {
    return <Navigate to="/wholesale/apply" replace />
  }

  if (user.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'APPROVED') {
    return <Outlet />
  }

  // Wholesale role but not approved: limited access (account status only), not full portal
  if (user.role === 'WHOLESALE') {
    if (isAccountPath) {
      return <Outlet />
    }

    const isRejected = user.wholesaleApprovalStatus === 'REJECTED'
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Wholesale Dashboard
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            {isRejected ? 'Wholesale application update' : 'Your wholesale account is pending approval'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            {isRejected
              ? 'Wholesale pricing and ordering are not available for this account. You can review your details on your wholesale account page or reach out if you have questions.'
              : 'You’re signed in as a wholesale applicant. Pricing and full portal access are available once your application is approved.'}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/wholesale/account"
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              My wholesale application status
            </Link>
            {!isRejected ? (
              <Link
                to="/wholesale/apply"
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Wholesale info & application
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return <Navigate to="/wholesale/apply" replace />
}

