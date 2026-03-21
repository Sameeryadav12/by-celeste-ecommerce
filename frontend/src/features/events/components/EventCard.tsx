import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import type { EventItem } from '../eventsTypes'
import { formatEventDateRange, formatEventLocationSummary } from '../eventsDate'
import { SmartImage } from '../../../components/media/SmartImage'

export function EventCard({ event }: { event: EventItem }) {
  const dateText = formatEventDateRange(event.startDateTime, event.endDateTime)

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4">
        {event.imageUrl ? (
          <div className="overflow-hidden rounded-lg bg-neutral-100">
            <SmartImage
              src={event.imageUrl}
              alt={event.title}
              wrapperClassName="relative aspect-[16/10] w-full"
              imgClassName="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{event.title}</h2>
          <p className="text-sm leading-6 text-neutral-700">{event.shortDescription}</p>
        </div>
        <dl className="space-y-1 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">When</dt>
            <dd className="text-neutral-800">{dateText.primary}</dd>
            <dd className="text-neutral-600">{dateText.secondary}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Where</dt>
            <dd className="text-neutral-700">{formatEventLocationSummary(event)}</dd>
          </div>
        </dl>
        <div>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
          >
            View details &amp; save the date
          </Link>
        </div>
      </div>
    </Card>
  )
}
