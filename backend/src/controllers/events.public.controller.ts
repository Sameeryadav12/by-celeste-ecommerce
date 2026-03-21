import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import { getPublicEventBySlug, listPublicEvents } from '../services/events.service'

function parseBool(v: unknown): boolean | undefined {
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return undefined
}

export const listEventsPublic = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query
  const page = q.page != null ? Number(q.page) : undefined
  const limit = q.limit != null ? Number(q.limit) : undefined

  if (page != null && (!Number.isFinite(page) || page < 1)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Query parameter "page" must be a positive number.',
    })
  }
  if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_QUERY',
      message: 'Query parameter "limit" must be a positive number.',
    })
  }

  const result = await listPublicEvents({
    page,
    limit,
    featured: parseBool(q.featured),
    search: typeof q.search === 'string' ? q.search : undefined,
    past: parseBool(q.past),
  })

  res.status(200).json({ success: true, data: result })
})

export const getEventBySlugPublic = asyncHandler(async (req: Request, res: Response) => {
  const slug = paramString(req.params.slug)
  if (!slug?.trim()) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_SLUG',
      message: 'Event slug is required.',
    })
  }

  const event = await getPublicEventBySlug(slug.trim())
  res.status(200).json({ success: true, data: { event } })
})
