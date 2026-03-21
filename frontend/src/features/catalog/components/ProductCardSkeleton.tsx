import { Card } from '../../../components/ui/Card'

export function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 animate-pulse flex-col gap-4">
        <div className="aspect-square w-full rounded-xl bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-neutral-200" />
          <div className="h-3 w-full rounded bg-neutral-200" />
          <div className="h-3 w-5/6 rounded bg-neutral-200" />
        </div>
        <div className="mt-auto flex flex-col gap-4 border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 w-1/3 rounded bg-neutral-200" />
            <div className="h-10 w-14 shrink-0 rounded-md bg-neutral-200" />
          </div>
          <div className="h-10 w-full rounded-md bg-neutral-200" />
        </div>
      </div>
    </Card>
  )
}
