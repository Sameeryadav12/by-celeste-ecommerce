import type { EventItem } from './eventsTypes'

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function formatIcsUtc(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function buildLocationString(e: EventItem): string {
  const parts = [
    e.locationName,
    e.addressLine1,
    e.addressLine2,
    e.suburb,
    e.state,
    e.postcode,
    e.country,
  ].filter(Boolean)
  return parts.join(', ')
}

/** Build a minimal .ics file for “Add to calendar” (no extra dependencies). */
export function buildEventIcs(e: EventItem): string {
  const uid = `${e.id}@byceleste.local`
  const dtStamp = formatIcsUtc(new Date().toISOString())
  const dtStart = formatIcsUtc(e.startDateTime)
  const dtEnd = formatIcsUtc(e.endDateTime)
  const summary = icsEscape(e.title)
  const description = icsEscape(e.shortDescription.slice(0, 2000))
  const location = icsEscape(buildLocationString(e))

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//By Celeste//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadEventIcs(e: EventItem): void {
  const ics = buildEventIcs(e)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${e.slug.replace(/[^a-z0-9-]+/gi, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export function googleMapsSearchUrl(e: EventItem): string {
  const q = buildLocationString(e)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}
