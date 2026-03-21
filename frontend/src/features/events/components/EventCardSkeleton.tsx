import { Card } from '../../../components/ui/Card'

export function EventCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="space-y-4">
        <div className="aspect-[16/10] w-full rounded-lg bg-neutral-200" />
        <div className="h-6 w-3/4 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-5/6 rounded bg-neutral-200" />
        <div className="h-4 w-1/2 rounded bg-neutral-200" />
      </div>
    </Card>
  )
}
