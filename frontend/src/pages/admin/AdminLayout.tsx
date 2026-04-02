import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AdminSidebarNavItem } from './components/AdminSidebarNavItem'

const NAV_GROUPS = [
  {
    label: null,
    items: [{ to: '/admin', label: 'Dashboard', icon: 'dashboard' as const }],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'products' as const },
      { to: '/admin/categories', label: 'Categories', icon: 'categories' as const },
      { to: '/admin/ingredients', label: 'Ingredients', icon: 'ingredients' as const },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: 'orders' as const },
      { to: '/admin/customers', label: 'Customers', icon: 'customers' as const },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/wholesale', label: 'Wholesale', icon: 'wholesale' as const },
      { to: '/admin/testimonials', label: 'Testimonials', icon: 'testimonials' as const },
      { to: '/admin/events', label: 'Events', icon: 'events' as const },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/marketing', label: 'Marketing', icon: 'marketing' as const },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/admin/theme', label: 'Theme / Appearance', icon: 'theme' as const },
      { to: '/admin/settings', label: 'Settings', icon: 'settings' as const },
    ],
  },
] as const

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="border-b border-slate-200 px-5 py-5">
        <Link
          to="/admin"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          onClick={closeSidebar}
        >
          <span className="block text-base font-semibold tracking-tight text-slate-900">
            By Celeste
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Admin Portal
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
            {group.label ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <AdminSidebarNavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  onClick={closeSidebar}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-xs text-slate-500">
          Signed in as{' '}
          <span className="font-medium text-slate-700">{user?.email}</span>
        </p>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              View store
            </Link>
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
