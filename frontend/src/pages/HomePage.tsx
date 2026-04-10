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
import { BrandIcon } from '../components/icons/BrandIcon'
import { Reveal } from '../components/animation/Reveal'
import {
  getPublicMarketingContent,
  getPublicTestimonials,
  getPublicThemeSettings,
  type MarketingContent,
  type PublicTestimonial,
  type ThemeSettings,
} from '../features/content/contentApi'

export function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])
  const [marketing, setMarketing] = useState<MarketingContent | null>(null)
  const [theme, setTheme] = useState<ThemeSettings | null>(null)

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

  useEffect(() => {
    let cancelled = false
    Promise.all([getPublicTestimonials(), getPublicMarketingContent(), getPublicThemeSettings()])
      .then(([ts, mc, themeData]) => {
        if (cancelled) return
        setTestimonials(ts)
        setMarketing(mc)
        setTheme(themeData)
      })
      .catch(() => {
        if (cancelled) return
        setTestimonials([])
        setMarketing(null)
        setTheme(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const testimonialPreview = (testimonials.length > 0 ? testimonials : []).slice(0, 4)
  const tagline = marketing?.homepageTagline ?? 'Traditional, Natural Exceptional Skincare'

  return (
    <>
      <Seo
        title="Natural skincare by By Celeste"
        description="By Celeste is a calm Australian skincare brand with gentle essentials, events, and honest ingredient information."
      />
      <section className="space-y-24 sm:space-y-28">
        {/* 1 — Hero: text branding only; visual mark lives in the header */}
        <Reveal className="max-w-3xl">
          <div className="space-y-2.5 sm:space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-neutral-500 sm:text-xs sm:tracking-[0.24em]">
              By Celeste
            </p>
            <p className="text-[0.8125rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-neutral-600 sm:text-sm sm:tracking-[0.12em]">
              {tagline}
            </p>
          </div>

          <h1
            className="mt-10 text-4xl font-semibold tracking-tight text-neutral-900 sm:mt-12 sm:text-5xl lg:mt-14 lg:text-[3.25rem] lg:leading-[1.15]"
            style={
              theme?.homepageHeroEmphasis
                ? { color: theme?.primaryBrandColor || undefined }
                : undefined
            }
          >
            {marketing?.homepageHeroHeading ?? 'Calm, considered skincare by By Celeste'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.65] text-neutral-500 sm:mt-6 sm:text-[1.0625rem] sm:leading-relaxed">
            {marketing?.homepageSubtext ??
              'Small-batch skincare rooted in regional Victoria — honest formulas and the warmth of local events. A quiet alternative to loud, mass-market beauty.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <Link
              to="/shop"
              className={[
                'rounded-md px-5 py-2.5 text-sm font-medium shadow-sm transition',
                theme?.buttonStyleEmphasis === 'soft'
                  ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800',
              ].join(' ')}
              style={theme?.buttonStyleEmphasis === 'soft' ? { borderColor: theme?.secondaryBrandColor } : undefined}
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
        </Reveal>

        {/* 2 — Featured products */}
        <Reveal className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {marketing?.featuredProductsHeading ?? 'Featured products'}
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
        </Reveal>

        {/* 3 — Our Ingredients */}
        <Reveal className="rounded-2xl border border-neutral-200/90 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {marketing?.ingredientsSectionHeading ?? 'Our Ingredients'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-neutral-500">
            {marketing?.ingredientsSectionText ??
              'We formulate with thoughtfully selected ingredients that support calm, healthy skin.'}
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {([
              { label: 'Plant oils', icon: 'plant-oils' },
              { label: 'Fruits', icon: 'fruits' },
              { label: 'Vegetables', icon: 'vegetables' },
              { label: 'Essential Oils', icon: 'essential-oils' },
              { label: 'Natives', icon: 'natives' },
              { label: 'Botanicals', icon: 'botanicals' },
            ] as const).map((item) => (
              <li
                key={item.label}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-5"
              >
                <BrandIcon name={item.icon} className="h-7 w-7 text-neutral-500" alt="" />
                <span className="text-sm font-medium text-neutral-800">{item.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* 4 — Events */}
        {upcomingEvents.length > 0 ? (
          <Reveal className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                  Upcoming events
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
                  Calm brand events where customers can experience By Celeste in person.
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
          </Reveal>
        ) : null}

        <Reveal className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {marketing?.testimonialsSectionHeading ?? 'What Our Customers Say'}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-500">
              {marketing?.testimonialsSectionSubheading ??
                'A few recent words from customers who use By Celeste every day.'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonialPreview.map((item) => (
              <article
                key={item.id}
                className="transform-gpu rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
              >
                <BrandIcon name="quote" className="h-4 w-4 opacity-25" alt="" />
                <p className="mt-2 text-sm leading-7 text-neutral-700">{item.text}</p>
                <p className="mt-4 border-t border-neutral-100 pt-3 text-sm font-semibold text-neutral-900">
                  {item.customerName}
                </p>
              </article>
            ))}
          </div>
          <div>
            <Link
              to="/testimonials"
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              View all testimonials
            </Link>
          </div>
        </Reveal>

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
            to="/wholesale/apply"
            className="font-medium text-neutral-800 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            Wholesale partners
          </Link>
        </div>
      </section>
    </>
  )
}
