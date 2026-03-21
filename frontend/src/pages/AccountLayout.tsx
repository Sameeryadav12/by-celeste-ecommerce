import { Link, Outlet, useLocation } from 'react-router-dom'

export function AccountLayout() {
  const { pathname } = useLocation()
  const isOrderDetail = /^\/account\/orders\/[^/]+$/.test(pathname)

  return (
    <section className="mx-auto max-w-5xl space-y-8 pb-16 pt-1 sm:pt-2">
      {isOrderDetail ? (
        <Link
          to="/account"
          className="inline-flex text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          ← Account overview
        </Link>
      ) : null}
      <Outlet />
    </section>
  )
}
