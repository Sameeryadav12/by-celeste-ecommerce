import { apiFetch } from '../../lib/api'
import type { EventItem, EventsPagination } from './eventsTypes'

type ListEventsApiResponse = {
  events: EventItem[]
  pagination: EventsPagination
}

type GetEventBySlugApiResponse = {
  event: EventItem
}

export type GetEventsQuery = {
  page?: number
  limit?: number
  featured?: boolean
  search?: string
  past?: boolean
}

export async function getEvents(query: GetEventsQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.featured) params.set('featured', 'true')
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.past) params.set('past', 'true')
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<ListEventsApiResponse>(`/api/events${suffix}`, { signal })
}

export async function getEventBySlug(slug: string, signal?: AbortSignal) {
  const data = await apiFetch<GetEventBySlugApiResponse>(`/api/events/${encodeURIComponent(slug)}`, {
    signal,
  })
  return data.event
}
