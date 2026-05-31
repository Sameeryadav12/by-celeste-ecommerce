import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

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

  // Only active ADMIN accounts may enter the admin portal. Everyone else (CUSTOMER, WHOLESALE,
  // inactive) is redirected to the storefront. Backend routes also enforce this via requireRole.
  if (user.role !== 'ADMIN' || user.isActive === false) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

