import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { slugify } from '../utils/slug'
import type { EventCreateInput, EventUpdateInput } from './events.validation'

type EventRow = {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  locationName: string
  addressLine1: string | null
  addressLine2: string | null
  suburb: string
  state: string
  postcode: string
  country: string
  startDateTime: Date
  endDateTime: Date
  imageUrl: string | null
  isPublished: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

function serializeEvent(e: EventRow) {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    shortDescription: e.shortDescription,
    description: e.description,
    locationName: e.locationName,
    addressLine1: e.addressLine1,
    addressLine2: e.addressLine2,
    suburb: e.suburb,
    state: e.state,
    postcode: e.postcode,
    country: e.country,
    startDateTime: e.startDateTime.toISOString(),
    endDateTime: e.endDateTime.toISOString(),
    imageUrl: e.imageUrl,
    isPublished: e.isPublished,
    isFeatured: e.isFeatured,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}

async function ensureUniqueEventSlug(base: string, excludeId?: string) {
  let candidate = base
  let n = 1
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

export type ListPublicEventsQuery = {
  page?: number
  limit?: number
  featured?: boolean
  search?: string
  past?: boolean
}

export async function listPublicEvents(query: ListPublicEventsQuery) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(50, Math.max(1, query.limit ?? 12))
  const now = new Date()

  const where: Prisma.EventWhereInput = {
    isPublished: true,
    ...(query.featured ? { isFeatured: true } : {}),
    ...(query.search?.trim()
      ? { title: { contains: query.search.trim(), mode: 'insensitive' } }
      : {}),
    ...(query.past ? { endDateTime: { lt: now } } : { endDateTime: { gte: now } }),
  }

  const [rows, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      // Upcoming-first behaviour: show soonest events first; featured filtering is handled separately.
      orderBy: [{ startDateTime: query.past ? 'desc' : 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return {
    events: rows.map(serializeEvent),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function getPublicEventBySlug(slug: string) {
  const event = await prisma.event.findFirst({
    where: { slug, isPublished: true },
  })

  if (!event) {
    throw new ApiError({
      statusCode: 404,
      code: 'EVENT_NOT_FOUND',
      message: 'Event not found.',
    })
  }

  return serializeEvent(event)
}

export async function listAdminEvents(query: {
  page?: number
  limit?: number
  includeUnpublished?: boolean
}) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? 20))
  const where: Prisma.EventWhereInput = query.includeUnpublished ? {} : { isPublished: true }

  const [rows, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: [{ startDateTime: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return {
    events: rows.map(serializeEvent),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createEvent(input: EventCreateInput) {
  const slug = input.slug?.length
    ? await ensureUniqueEventSlug(input.slug)
    : await ensureUniqueEventSlug(slugify(input.title))

  const created = await prisma.event.create({
    data: {
      title: input.title.trim(),
      slug,
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      locationName: input.locationName.trim(),
      addressLine1: input.addressLine1?.trim() || null,
      addressLine2: input.addressLine2?.trim() || null,
      suburb: input.suburb.trim(),
      state: input.state,
      postcode: input.postcode.trim(),
      country: input.country.trim(),
      startDateTime: new Date(input.startDateTime),
      endDateTime: new Date(input.endDateTime),
      imageUrl: input.imageUrl?.trim() || null,
      isPublished: input.isPublished ?? false,
      isFeatured: input.isFeatured ?? false,
    },
  })

  return serializeEvent(created)
}

export async function updateEvent(id: string, input: EventUpdateInput) {
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'EVENT_NOT_FOUND',
      message: 'Event not found.',
    })
  }

  const slug =
    input.slug != null
      ? await ensureUniqueEventSlug(input.slug, id)
      : existing.slug

  const startDate = input.startDateTime
    ? new Date(input.startDateTime)
    : existing.startDateTime
  const endDate = input.endDateTime
    ? new Date(input.endDateTime)
    : existing.endDateTime
  if (endDate <= startDate) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_EVENT_DATES',
      message: 'End date/time must be after the start date/time.',
    })
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(input.title != null ? { title: input.title.trim() } : {}),
      slug,
      ...(input.shortDescription != null
        ? { shortDescription: input.shortDescription.trim() }
        : {}),
      ...(input.description != null ? { description: input.description.trim() } : {}),
      ...(input.locationName != null ? { locationName: input.locationName.trim() } : {}),
      ...(input.addressLine1 !== undefined
        ? { addressLine1: input.addressLine1?.trim() || null }
        : {}),
      ...(input.addressLine2 !== undefined
        ? { addressLine2: input.addressLine2?.trim() || null }
        : {}),
      ...(input.suburb != null ? { suburb: input.suburb.trim() } : {}),
      ...(input.state != null ? { state: input.state } : {}),
      ...(input.postcode != null ? { postcode: input.postcode.trim() } : {}),
      ...(input.country != null ? { country: input.country.trim() } : {}),
      ...(input.startDateTime != null ? { startDateTime: new Date(input.startDateTime) } : {}),
      ...(input.endDateTime != null ? { endDateTime: new Date(input.endDateTime) } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl?.trim() || null } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
    },
  })

  return serializeEvent(updated)
}

/** Soft delete choice: keep history and URLs stable, simply unpublish. */
export async function unpublishEvent(id: string) {
  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'EVENT_NOT_FOUND',
      message: 'Event not found.',
    })
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { isPublished: false, isFeatured: false },
  })

  return serializeEvent(updated)
}
