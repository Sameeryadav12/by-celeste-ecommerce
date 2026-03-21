import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { createCheckoutSessionSchema } from '../services/checkout.validation'
import { createCheckoutSession } from '../services/checkout.service'

export const postCreateCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCheckoutSessionSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check your checkout details and try again.',
      details: parsed.error.flatten(),
    })
  }

  const result = await createCheckoutSession({
    input: parsed.data,
    userId: req.user?.id,
  })

  res.status(201).json({ success: true, data: result })
})
