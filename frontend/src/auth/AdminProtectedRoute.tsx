import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { BUSINESS_DETAILS } from '../config/businessDetails'
import { useAuth } from './AuthContext'

const CANONICAL_ADMIN_EMAIL = BUSINESS_DETAILS.adminEmail.trim().toLowerCase()

export function AdminProtectedRoute() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-600">
        Checking your admin session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Only the canonical admin inbox may use the admin portal (see businessDetails.adminEmail).
  const isAllowedAdmin =
    user.role === 'ADMIN' &&
    user.isActive !== false &&
    user.email.trim().toLowerCase() === CANONICAL_ADMIN_EMAIL

  if (!isAllowedAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

