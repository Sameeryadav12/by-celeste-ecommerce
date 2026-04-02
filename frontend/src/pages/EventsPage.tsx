import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Seo } from '../components/seo/Seo'
import { CatalogEmptyState } from '../features/catalog/components/CatalogEmptyState'
import { EventCard } from '../features/events/components/EventCard'
import { EventCardSkeleton } from '../features/events/components/EventCardSkeleton'
import { getEvents, type GetEventsQuery } from '../features/events/eventsApi'
import type { EventItem } from '../features/events/eventsTypes'
import { Reveal } from '../components/animation/Reveal'

function buildQuery(overrides: GetEventsQuery): GetEventsQuery {
  return overrides
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [featured, setFeatured] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const featuredQuery = buildQuery({ limit: 1, featured: true, search })
    const listQuery = buildQuery({ limit: 12, search })

    Promise.all([
      getEvents(featuredQuery, controller.signal),
      getEvents(listQuery, controller.signal),
    ])
      .then(([featuredRes, listRes]) => {
        setFeatured(featuredRes.events[0] ?? null)
        setEvents(listRes.events)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Could not load events right now.')
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [search])

  const nonFeaturedEvents = useMemo(() => {
    if (!featured) return events
    return events.filter((e) => e.id !== featured.id)
  }, [events, featured])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <>
      <Seo
        title="Events | By Celeste"
        description="Discover By Celeste pop-ups and community moments. Explore upcoming events across Australia."
      />
      <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Events</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-700">
          Discover By Celeste pop-ups and community moments. Upcoming events are listed here first
          so customers can plan ahead.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search event title"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 sm:max-w-sm"
        />
        <button
          type="submit"
          className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Search
        </button>
      </form>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        </Reveal>
      ) : (
        <>
          {featured ? (
            <Reveal className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Featured upcoming event
              </h2>
              <EventCard event={featured} />
            </Reveal>
          ) : null}

          <Reveal className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Upcoming events</h2>
            {nonFeaturedEvents.length === 0 ? (
              <CatalogEmptyState message="No upcoming events match your search right now." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {nonFeaturedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </Reveal>
        </>
      )}
      </section>
    </>
  )
}

