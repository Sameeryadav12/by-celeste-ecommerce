import { Link } from 'react-router-dom'

const linkClass =
  'inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50'

export function AdminPage() {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Admin</h1>
      <p className="max-w-xl text-sm text-neutral-600">
        Use the dashboard for day-to-day work. This page is a quick jump menu if you land here
        directly.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to="/admin" className={linkClass}>
          Dashboard
        </Link>
        <Link to="/admin/orders" className={linkClass}>
          Orders
        </Link>
        <Link to="/admin/products" className={linkClass}>
          Products
        </Link>
        <Link to="/admin/wholesale" className={linkClass}>
          Wholesale
        </Link>
        <Link to="/admin/settings" className={linkClass}>
          Settings
        </Link>
      </div>
    </section>
  )
}
