import { NavLink } from 'react-router-dom'

export type AdminIconName =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'ingredients'
  | 'orders'
  | 'customers'
  | 'wholesale'
  | 'testimonials'
  | 'events'
  | 'marketing'
  | 'theme'
  | 'settings'

const ICON_PATHS: Record<AdminIconName, string> = {
  dashboard:
    'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  products:
    'M20.5 7.28L12 2 3.5 7.28V16.72L12 22l8.5-5.28V7.28ZM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  categories:
    'M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  ingredients:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z',
  orders:
    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 14h6M9 18h6M9 10h6',
  customers:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  wholesale:
    'M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7M4 3h16l1 4H3l1-4ZM5 21V10.85M19 21V10.85',
  testimonials:
    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.286 7.03a1 1 0 0 0 .95.69h7.392c.969 0 1.371 1.24.588 1.81l-5.98 4.344a1 1 0 0 0-.364 1.118l2.286 7.03c.3.921-.755 1.688-1.539 1.118l-5.98-4.344a1 1 0 0 0-1.176 0l-5.98 4.344c-.783.57-1.838-.197-1.539-1.118l2.286-7.03a1 1 0 0 0-.364-1.118L.587 12.457c-.784-.57-.381-1.81.588-1.81h7.392a1 1 0 0 0 .95-.69l2.286-7.03Z',
  events:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01',
  marketing:
    'M22 12h-4l-3 9L9 3l-3 9H2',
  theme:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-.5c0-.25-.1-.48-.27-.65a.97.97 0 0 1-.23-.72c.08-.74.72-1.13 1.42-1.13H16a4 4 0 0 0 4-4c0-4.42-3.58-8-8-8ZM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.05 1.38 1.13L21 10a2 2 0 0 1 0 4h-.09c-.6.08-1.12.53-1.38 1.13Z',
}

function SidebarIcon({ name }: { name: AdminIconName }) {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  )
}

export function AdminSidebarNavItem({
  to,
  label,
  icon,
  onClick,
}: {
  to: string
  label: string
  icon: AdminIconName
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
      end={to === '/admin'}
    >
      <SidebarIcon name={icon} />
      {label}
    </NavLink>
  )
}
