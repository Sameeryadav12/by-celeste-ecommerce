import { Card } from '../../../components/ui/Card'

export function AdminSummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <Card className="border-neutral-200 bg-white/90">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
          {subtitle ? <p className="text-xs text-neutral-500">{subtitle}</p> : null}
        </div>
      </div>
    </Card>
  )
}

