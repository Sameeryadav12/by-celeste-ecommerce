import { useEffect, useState } from 'react'
import { fetchAdminSummary, type AdminSummary } from '../../features/admin/adminApi'
import { AdminSummaryCard } from './components/AdminSummaryCard'
import { Card } from '../../components/ui/Card'

function valueOrDash(v: number | undefined) {
  return v == null ? '-' : v
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load admin summary.')
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Dashboard</h2>
        <p className="text-sm text-neutral-600">
          Quick overview of products, orders, and upcoming events.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="h-24 animate-pulse">
              <span className="sr-only">Loading summary</span>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminSummaryCard title="Total products" value={valueOrDash(summary?.totalProducts)} />
          <AdminSummaryCard title="Active products" value={valueOrDash(summary?.activeProducts)} />
          <AdminSummaryCard title="Total orders" value={valueOrDash(summary?.totalOrders)} />
          <AdminSummaryCard title="Paid orders" value={valueOrDash(summary?.paidOrders)} />
          <AdminSummaryCard title="Upcoming events" value={valueOrDash(summary?.upcomingEvents)} />
        </div>
      )}
    </div>
  )
}

