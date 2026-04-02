import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { getEventBySlug } from '../features/events/eventsApi'
import type { EventItem } from '../features/events/eventsTypes'
import { formatEventDateRange, formatEventLocationSummary } from '../features/events/eventsDate'
import { Button } from '../components/ui/Button'
import { Seo } from '../components/seo/Seo'
import { SmartImage } from '../components/media/SmartImage'
import { downloadEventIcs, googleMapsSearchUrl } from '../features/events/eventCalendar'
import { BrandIcon } from '../components/icons/BrandIcon'

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      setNotFound(true)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setNotFound(false)
    setError(null)

    getEventBySlug(slug, controller.signal)
      .then((e) => {
        setEvent(e)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Could not load event details.'
        if (message.toLowerCase().includes('not found')) {
          setNotFound(true)
          return
        }
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [slug])

  if (loading) {
    const title = 'Event | By Celeste'
    return (
      <section className="space-y-6">
        <Seo
          title={title}
          description="Discover details about upcoming By Celeste pop-ups and community events."
        />
        <Card>
          <div className="space-y-3 animate-pulse" aria-busy>
            <div className="h-8 w-2/3 rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-5/6 rounded bg-neutral-200" />
            <div className="h-60 w-full rounded bg-neutral-200" />
          </div>
        </Card>
      </section>
    )
  }

  if (notFound || !event) {
    const title = 'Event not found | By Celeste'
    return (
      <section className="space-y-4">
        <Seo
          title={title}
          description="This event may be unpublished or the link may be incorrect."
        />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Event not found</h1>
        <Card>
          <p className="text-sm text-neutral-700">
            This event may be unpublished or the link might be incorrect.
          </p>
          <div className="mt-4">
            <Link to="/events">
              <Button type="button" variant="ghost">
                Back to events
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    )
  }

  const dateText = formatEventDateRange(event.startDateTime, event.endDateTime)

  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined
  const jsonLd =
    event && url
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          description: event.shortDescription,
          startDate: new Date(event.startDateTime).toISOString(),
          endDate: new Date(event.endDateTime).toISOString(),
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          url,
          location: {
            '@type': 'Place',
            name: event.locationName,
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.addressLine1 ?? undefined,
              addressLocality: event.suburb,
              addressRegion: event.state,
              postalCode: event.postcode,
              addressCountry: event.country,
            },
          },
          image: event.imageUrl ?? undefined,
        }
      : event
        ? {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.title,
            description: event.shortDescription,
            startDate: new Date(event.startDateTime).toISOString(),
            endDate: new Date(event.endDateTime).toISOString(),
            location: {
              '@type': 'Place',
              name: event.locationName,
              address: {
                '@type': 'PostalAddress',
                streetAddress: event.addressLine1 ?? undefined,
                addressLocality: event.suburb,
                addressRegion: event.state,
                postalCode: event.postcode,
                addressCountry: event.country,
              },
            },
            image: event.imageUrl ?? undefined,
          }
        : undefined

  return (
    <>
      <Seo
        title={`${event.title} | By Celeste`}
        description={event.shortDescription}
        jsonLd={jsonLd}
      />
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{event.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-700">{event.shortDescription}</p>
        </div>

        {event.imageUrl ? (
          <Card className="overflow-hidden p-0">
            <div className="overflow-hidden">
              <SmartImage
                src={event.imageUrl}
                alt={event.title}
                wrapperClassName="relative h-64 w-full"
                imgClassName="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </Card>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Details</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
              {event.description}
            </p>
          </Card>

          <div className="space-y-4">
            <Card>
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                <BrandIcon name="calendar" className="h-4 w-4 opacity-40" alt="" />
                When
              </h2>
              <dl className="mt-3 space-y-1 text-sm text-neutral-700">
                <dd className="text-base font-medium text-neutral-900">{dateText.primary}</dd>
                <dd className="text-neutral-600">{dateText.secondary}</dd>
              </dl>
              <Button
                type="button"
                variant="ghost"
                className="mt-4 w-full border border-neutral-200 sm:w-auto"
                onClick={() => downloadEventIcs(event)}
              >
                Add to calendar (.ics)
              </Button>
            </Card>

            <Card>
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                <BrandIcon name="location" className="h-4 w-4 opacity-40" alt="" />
                Where
              </h2>
              <p className="mt-3 text-sm font-medium text-neutral-900">
                {formatEventLocationSummary(event)}
              </p>
              {event.addressLine1 ? (
                <p className="mt-1 text-sm text-neutral-600">{event.addressLine1}</p>
              ) : null}
              {event.addressLine2 ? (
                <p className="mt-1 text-sm text-neutral-600">{event.addressLine2}</p>
              ) : null}
              <a
                href={googleMapsSearchUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-700"
              >
                Open in Google Maps
              </a>
            </Card>

            <p className="text-xs text-neutral-500">
              Times follow the listing from our team; add to calendar to keep the slot on your device.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/events">
            <Button type="button" variant="ghost">
              ← All events
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}

