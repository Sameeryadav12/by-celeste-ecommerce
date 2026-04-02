import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminSummary, type AdminSummary } from '../../features/admin/adminApi'
import { AdminSummaryCard } from './components/AdminSummaryCard'
import { Card } from '../../components/ui/Card'

function valueOrDash(v: number | undefined) {
  return v == null ? '\u2014' : v
}

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAdminSummary()
        if (!cancelled) setSummary(data)
      } catch (e) {
        if (!cancelled) setError('Could not load dashboard summary.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your store, orders, and upcoming activity.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminSummaryCard
            title="Total products"
            value={valueOrDash(summary?.totalProducts)}
            subtitle="In catalogue"
          />
          <AdminSummaryCard
            title="Active products"
            value={valueOrDash(summary?.activeProducts)}
            subtitle="Visible to customers"
          />
          <AdminSummaryCard
            title="Total orders"
            value={valueOrDash(summary?.totalOrders)}
            subtitle="All time"
          />
          <AdminSummaryCard
            title="Paid orders"
            value={valueOrDash(summary?.paidOrders)}
            subtitle="Payment confirmed"
          />
          <AdminSummaryCard
            title="Upcoming events"
            value={valueOrDash(summary?.upcomingEvents)}
            subtitle="Scheduled"
          />
          <AdminSummaryCard
            title="Wholesale"
            value="\u2014"
            subtitle="Pending applications"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/admin/products"
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Manage products
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View orders
            </Link>
            <Link
              to="/admin/events"
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Manage events
            </Link>
            <Link
              to="/admin/wholesale"
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Wholesale applications
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Admin portal status</h2>
          <p className="mt-2 text-sm text-slate-500">
            The admin portal is now integrated for catalogue, sales, wholesale moderation, content,
            and business settings. Customer management remains the next planned module.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Products', ready: true },
              { label: 'Categories', ready: true },
              { label: 'Ingredients', ready: true },
              { label: 'Orders', ready: true },
              { label: 'Events', ready: true },
              { label: 'Wholesale', ready: true },
              { label: 'Customers', ready: false },
              { label: 'Testimonials', ready: true },
              { label: 'Marketing', ready: true },
              { label: 'Theme', ready: true },
              { label: 'Settings', ready: true },
            ].map((s) => (
              <span
                key={s.label}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                  s.ready
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-1.5 w-1.5 rounded-full',
                    s.ready ? 'bg-emerald-500' : 'bg-slate-400',
                  ].join(' ')}
                />
                {s.label}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
