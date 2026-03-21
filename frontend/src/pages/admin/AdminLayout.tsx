import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { AdminSidebarNavItem } from './components/AdminSidebarNavItem'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Admin</h1>
          <p className="text-sm text-neutral-600">
            Manage products, categories, ingredients, events, and orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px,1fr]">
        <aside className="md:sticky md:top-6">
          <Card className="p-2">
            <div className="space-y-1">
              <AdminSidebarNavItem to="/admin" label="Dashboard" />
              <AdminSidebarNavItem to="/admin/products" label="Products" />
              <AdminSidebarNavItem to="/admin/categories" label="Categories" />
              <AdminSidebarNavItem to="/admin/ingredients" label="Ingredients" />
              <AdminSidebarNavItem to="/admin/orders" label="Orders" />
              <AdminSidebarNavItem to="/admin/events" label="Events" />
            </div>
          </Card>
          <div className="mt-4 hidden text-xs text-neutral-500 md:block">
            Signed in as <span className="font-medium text-neutral-700">{user?.email}</span>
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

