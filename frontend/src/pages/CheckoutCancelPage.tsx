import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function CheckoutCancelPage() {
  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Payment not completed</h1>
        <p className="text-sm leading-6 text-neutral-700">
          You left the Square checkout before finishing. Nothing has been charged. Your cart is still
          available on this device unless you cleared it.
        </p>
      </div>

      <Card>
        <p className="text-sm text-neutral-700">
          Square does not always send shoppers to a custom “cancel” page automatically. This screen is
          here so you have a calm place to land if you bookmark it or follow a cancel link from your
          project notes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/checkout">
            <Button type="button">Back to checkout</Button>
          </Link>
          <Link to="/cart">
            <Button type="button" variant="ghost">
              View cart
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  )
}
