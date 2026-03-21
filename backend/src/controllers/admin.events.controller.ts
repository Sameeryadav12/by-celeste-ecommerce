import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import { eventCreateSchema, eventUpdateSchema } from '../services/events.validation'
import { createEvent, listAdminEvents, unpublishEvent, updateEvent } from '../services/events.service'

export const adminListEvents = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query
  const page = q.page != null ? Number(q.page) : undefined
  const limit = q.limit != null ? Number(q.limit) : undefined
  const includeUnpublished = q.includeUnpublished === 'true' || q.includeUnpublished === '1'

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

  const result = await listAdminEvents({ page, limit, includeUnpublished })
  res.status(200).json({ success: true, data: result })
})

export const adminCreateEvent = asyncHandler(async (req: Request, res: Response) => {
  const parsed = eventCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the event fields and try again.',
      details: parsed.error.flatten(),
    })
  }

  const event = await createEvent(parsed.data)
  res.status(201).json({ success: true, data: { event } })
})

export const adminUpdateEvent = asyncHandler(async (req: Request, res: Response) => {
  const parsed = eventUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check the event fields and try again.',
      details: parsed.error.flatten(),
    })
  }

  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Event id is required.' })
  }

  const event = await updateEvent(id, parsed.data)
  res.status(200).json({ success: true, data: { event } })
})

export const adminDeleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Event id is required.' })
  }

  const event = await unpublishEvent(id)
  res.status(200).json({
    success: true,
    data: { event, message: 'Event unpublished.' },
  })
})
