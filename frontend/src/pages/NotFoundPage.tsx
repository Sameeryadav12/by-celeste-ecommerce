import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Seo } from '../components/seo/Seo'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-lg space-y-6">
      <Seo
        title="Page not found | By Celeste"
        description="We couldn't find that page. Return to the shop to keep exploring By Celeste."
      />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Page not found</h1>
        <p className="text-sm leading-6 text-neutral-700">
          The link you followed may be incorrect or the page may have moved.
        </p>
      </div>
      <Card>
        <div className="flex flex-wrap gap-3">
          <Link to="/shop">
            <Button type="button">Back to Shop</Button>
          </Link>
          <Link to="/">
            <Button type="button" variant="ghost">
              Home
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  )
}

