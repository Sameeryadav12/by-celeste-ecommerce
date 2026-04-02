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
    <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50/50">
      <Button
        type="button"
        variant="ghost"
        onClick={onDecrease}
        disabled={atMin}
        className="h-8 w-8 p-0 text-base"
        aria-label="Decrease quantity"
      >
        −
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
        className="h-8 w-10 border-x border-neutral-200 bg-white text-center text-sm font-medium text-neutral-900 outline-none focus:border-neutral-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="ghost"
        onClick={onIncrease}
        disabled={atMax}
        className="h-8 w-8 p-0 text-base"
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  )
}
