import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function WholesaleProtectedRoute() {
  const { status, user } = useAuth()
  const location = useLocation()
  const isWholesaleAccountPath = location.pathname === '/wholesale/account'

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

  if (user.wholesaleApprovalStatus !== 'APPROVED' && !isWholesaleAccountPath) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Wholesale Dashboard
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            Your wholesale account is pending approval
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            You’re signed in, but wholesale pricing and portal access are only available once your
            account is approved.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/wholesale/account"
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Go to my wholesale account
            </Link>
            <Link
              to="/wholesale/apply"
              className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Wholesale info & application
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}

