import { Button } from '../../../components/ui/Button'

export function QuantityControl({
  quantity,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  onSet,
}: {
  quantity: number
  min?: number
  max?: number
  onDecrease: () => void
  onIncrease: () => void
  onSet: (value: number) => void
}) {
  const atMin = quantity <= min
  const atMax = max != null ? quantity >= max : false

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white p-1">
      <Button type="button" variant="ghost" onClick={onDecrease} disabled={atMin} className="px-2 py-1">
        -
      </Button>
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          onSet(next)
        }}
        className="w-14 rounded border border-neutral-200 px-2 py-1 text-center text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
      <Button
        type="button"
        variant="ghost"
        onClick={onIncrease}
        disabled={atMax}
        className="px-2 py-1"
      >
        +
      </Button>
    </div>
  )
}

