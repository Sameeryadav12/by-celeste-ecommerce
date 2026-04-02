import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { paramString } from '../utils/routeParams'
import {
  createTestimonial,
  deleteTestimonial,
  listAdminTestimonials,
  listPublicTestimonials,
  updateTestimonial,
} from '../services/testimonials.service'

export const publicListTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await listPublicTestimonials()
  res.json({ success: true, data: { testimonials } })
})

export const adminListTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await listAdminTestimonials()
  res.json({ success: true, data: { testimonials } })
})

export const adminCreateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    customerName?: unknown
    text?: unknown
    isVisible?: unknown
    isFeatured?: unknown
  }
  if (typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Customer name is required.',
    })
  }
  if (typeof body.text !== 'string' || body.text.trim().length < 8) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Testimonial text is required.',
    })
  }
  const testimonial = await createTestimonial({
    customerName: body.customerName,
    text: body.text,
    isVisible: typeof body.isVisible === 'boolean' ? body.isVisible : undefined,
    isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined,
  })
  res.status(201).json({ success: true, data: { testimonial } })
})

export const adminUpdateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Testimonial id is required.' })
  }
  const body = req.body as {
    customerName?: unknown
    text?: unknown
    isVisible?: unknown
    isFeatured?: unknown
  }
  const testimonial = await updateTestimonial(id, {
    customerName: typeof body.customerName === 'string' ? body.customerName : undefined,
    text: typeof body.text === 'string' ? body.text : undefined,
    isVisible: typeof body.isVisible === 'boolean' ? body.isVisible : undefined,
    isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined,
  })
  res.json({ success: true, data: { testimonial } })
})

export const adminDeleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const id = paramString(req.params.id)
  if (!id) {
    throw new ApiError({ statusCode: 400, code: 'INVALID_ID', message: 'Testimonial id is required.' })
  }
  await deleteTestimonial(id)
  res.json({ success: true, data: { message: 'Testimonial removed.' } })
})
