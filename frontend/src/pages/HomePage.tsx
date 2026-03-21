import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/seo/Seo'
import { EventCard } from '../features/events/components/EventCard'
import { getEvents } from '../features/events/eventsApi'
import type { EventItem } from '../features/events/eventsTypes'
import { getProducts } from '../features/catalog/catalogApi'
import type { CatalogProduct } from '../features/catalog/catalogTypes'
import { ProductCard } from '../features/catalog/components/ProductCard'
import { ProductCardSkeleton } from '../features/catalog/components/ProductCardSkeleton'

const NATIVE_INGREDIENTS = [
  {
    name: 'Kakadu Plum',
    line: 'A native superfruit, prized for brightening and antioxidant support.',
  },
  {
    name: 'Desert Lime',
    line: 'Australian desert citrus — fresh, renewing energy for tired skin.',
  },
  {
    name: 'Banksia',
    line: 'Wildflower botanicals that echo open bushland and calm formulation.',
  },
] as const

export function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setFeaturedLoading(true)
    getProducts({ limit: 6, featured: true, sort: 'name_asc' }, controller.signal)
      .then((res) => {
        if (res.products.length > 0) {
          setFeaturedProducts(res.products)
        } else {
          return getProducts({ limit: 6, sort: 'name_asc' }, controller.signal).then((r) => {
            setFeaturedProducts(r.products)
          })
        }
      })
      .catch(() => {
        setFeaturedProducts([])
      })
      .finally(() => {
        setFeaturedLoading(false)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getEvents({ limit: 2, featured: true }, controller.signal)
      .then((res) => {
        const events = res.events
        if (events.length > 0) {
          setUpcomingEvents(events)
        } else {
          getEvents({ limit: 2 }, controller.signal)
            .then((r) => setUpcomingEvents(r.events))
            .catch(() => {})
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return (
    <>
      <Seo
        title="Natural skincare by Celeste"
        description="By Celeste is a calm Australian skincare brand with gentle essentials, pop-up events, and honest ingredient information."
      />
      <section className="space-y-24 sm:space-y-28">
        {/* 1 — Hero */}
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            Calm, considered skincare by Celeste
          </h1>
          <p className="text-lg font-medium tracking-wide text-neutral-800 sm:text-xl">
            Traditional, Natural, Exceptional Skincare
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-500 sm:text-[1.05rem]">
            Small-batch skincare rooted in regional Victoria — honest formulas and the warmth of
            pop-ups and workshops. A quiet alternative to loud, mass-market beauty.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/shop"
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Browse the shop
            </Link>
            <Link
              to="/events"
              className="rounded-md px-5 py-2.5 text-sm font-medium text-neutral-800 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
            >
              Explore upcoming events
            </Link>
          </div>
        </div>

        {/* 2 — Featured products */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Featured products
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
              A curated selection from the shop — same quality and detail on every product page.
            </p>
          </div>
          {featuredLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Products will appear here once the catalog is available.{' '}
              <Link to="/shop" className="font-medium text-neutral-900 underline-offset-2 hover:underline">
                Open the shop
              </Link>
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div>
            <Link
              to="/shop"
              className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
            >
              View full shop →
            </Link>
          </div>
        </div>

        {/* 3 — Australian native ingredients */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Australian native ingredients
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-neutral-500">
            We build formulas around botanicals you can recognise — never noisy, always purposeful.
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
            {NATIVE_INGREDIENTS.map((item) => (
              <li key={item.name} className="text-center sm:text-left">
                <p className="text-sm font-semibold tracking-tight text-neutral-900">{item.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.line}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* 4 — Events */}
        {upcomingEvents.length > 0 ? (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                  Upcoming events
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
                  Workshops and pop-ups — experience the brand beyond the screen.
                </p>
              </div>
              <Link
                to="/events"
                className="shrink-0 self-start rounded-md px-4 py-2 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 transition hover:bg-neutral-50 sm:self-auto"
              >
                See all dates
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Compact links — wholesale / about (minimal clutter) */}
        <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-10 text-sm text-neutral-500">
          <span className="w-full text-xs font-medium uppercase tracking-wider text-neutral-400">
            More
          </span>
          <Link
            to="/about"
            className="font-medium text-neutral-800 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            About the brand
          </Link>
          <span className="text-neutral-300" aria-hidden>
            ·
          </span>
          <Link
            to="/wholesale"
            className="font-medium text-neutral-800 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            Wholesale partners
          </Link>
        </div>
      </section>
    </>
  )
}
