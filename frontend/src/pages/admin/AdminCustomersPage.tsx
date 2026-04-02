import { Card } from '../../components/ui/Card'

export function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage customer accounts, order history, and loyalty details.
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Customer management</h2>
        <p className="mt-2 text-sm text-slate-600">
          This section will provide tools to manage customer accounts across the store.
        </p>
        <div className="mt-4 space-y-3">
          <PlannedFeature
            title="Customer list"
            description="Search and browse all registered customers with filters for role, signup date, and order history."
          />
          <PlannedFeature
            title="Customer details"
            description="View individual customer profiles including order history, account status, and contact information."
          />
          <PlannedFeature
            title="Account actions"
            description="Deactivate accounts, reset passwords, or update customer roles when needed."
          />
          <PlannedFeature
            title="Loyalty overview"
            description="See loyalty point balances and transaction history for each customer."
          />
        </div>
      </Card>
    </div>
  )
}

function PlannedFeature({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 py-3">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  )
}
