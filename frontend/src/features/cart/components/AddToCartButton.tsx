import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { useCart } from '../CartContext'

type CartProductInput = {
  productId: string
  slug: string
  name: string
  imageUrl: string
  price: number
  compareAtPrice: number | null
  stockQuantity: number
  categoryName?: string
  shortDescription?: string
}

const SUCCESS_TOAST_MS = 2500
const BUTTON_ADDED_MS = 2000

export function AddToCartButton({
  product,
  className,
  quantity,
}: {
  product: CartProductInput
  className?: string
  quantity?: number
}) {
  const { addItem } = useCart()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [buttonAdded, setButtonAdded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const outOfStock = product.stockQuantity <= 0

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

  function queueTimeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  function handleAdd() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setErrorMessage(null)
    setShowSuccessToast(false)
    setButtonAdded(false)

    const result = addItem({ ...product, quantity })

    if (result.added) {
      setShowSuccessToast(true)
      setButtonAdded(true)
      queueTimeout(() => setButtonAdded(false), BUTTON_ADDED_MS)
      queueTimeout(() => setShowSuccessToast(false), SUCCESS_TOAST_MS)
    } else {
      setErrorMessage(result.message)
      queueTimeout(() => setErrorMessage(null), 3200)
    }
  }

  return (
    <div className="relative space-y-2">
      <Button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={[
          className,
          'transform-gpu transition-all duration-200 ease-in-out',
          buttonAdded ? 'scale-[1.02]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        variant="primary"
        aria-live="polite"
      >
        {outOfStock ? 'Out of stock' : buttonAdded ? 'Added ✓' : 'Add to Cart'}
      </Button>

      {showSuccessToast ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-2 text-xs text-emerald-950"
        >
          <span className="font-medium tracking-tight">Added to cart ✓</span>
          <Link
            to="/cart"
            className="font-medium text-emerald-800 underline decoration-emerald-300/80 underline-offset-2 transition hover:text-emerald-950 hover:decoration-emerald-500"
          >
            View cart
          </Link>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs leading-relaxed text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
