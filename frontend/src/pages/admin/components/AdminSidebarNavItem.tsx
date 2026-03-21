import { NavLink } from 'react-router-dom'

export function AdminSidebarNavItem({
  to,
  label,
}: {
  to: string
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition',
          isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
        ].join(' ')
      }
      end={to === '/admin'}
    >
      {label}
    </NavLink>
  )
}

