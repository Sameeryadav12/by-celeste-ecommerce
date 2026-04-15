import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { WS_SECONDARY } from './wholesaleUi'

type NavItem = {
  label: string
  to: string
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', to: '/wholesale' },
  { label: 'Wholesale Shop', to: '/wholesale/shop' },
  { label: 'My Orders', to: '/wholesale/orders' },
  { label: 'My Account', to: '/wholesale/account' },
]

const secondaryNav: NavItem[] = [{ label: 'Support', to: '/wholesale/support' }]

function SidebarNavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/wholesale'}
      className={({ isActive }) =>
        [
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

export function WholesaleLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-neutral-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:justify-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Wholesale Dashboard
              </div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">By Celeste</div>
            </div>
          </div>

          <nav className="px-3 pb-6">
            <div className="space-y-1">
              {primaryNav.map((item) => (
                <SidebarNavItem key={item.to} item={item} />
              ))}
            </div>

            <div className="mt-5 border-t border-neutral-200 pt-3">
              <div className="space-y-1">
                <SidebarNavItem item={{ label: 'Bulk Orders', to: '/wholesale/bulk-orders' }} />
                {secondaryNav.map((item) => (
                  <SidebarNavItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">Wholesale Portal</div>
                <div className="mt-0.5 truncate text-[11px] font-normal text-neutral-400">
                  Signed in as {user?.email ?? '—'}
                </div>
              </div>
              <a href="/" className={`${WS_SECONDARY} px-3 py-1.5 text-xs`}>
                Back to store
              </a>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

