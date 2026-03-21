/** Australian-friendly event date and time formatting helpers. */
export function formatEventDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  const sameDay = start.toDateString() === end.toDateString()
  const dayText = new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZoneName: 'short',
  }).format(start)

  if (sameDay) {
    const times = `${new Intl.DateTimeFormat('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(start)} - ${new Intl.DateTimeFormat('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(end)}`
    return { primary: dayText, secondary: times }
  }

  const range = `${new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(start)} - ${new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(end)}`

  return { primary: 'Multi-day event', secondary: range }
}

export function formatEventLocationSummary(event: {
  locationName: string
  suburb: string
  state: string
}) {
  return `${event.locationName}, ${event.suburb} ${event.state}`
}
