import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { createCheckoutSessionSchema } from '../services/checkout.validation'
import { createCheckoutSession } from '../services/checkout.service'
import {
  getSquareSetupStatus,
  SQUARE_CHECKOUT_UNAVAILABLE_MESSAGE,
} from '../services/squareClient'

export const getCheckoutReadiness = asyncHandler(async (_req: Request, res: Response) => {
  const setup = getSquareSetupStatus()
  res.json({
    success: true,
    data: {
      checkoutAvailable: setup.checkoutReady,
      message: setup.checkoutReady ? null : SQUARE_CHECKOUT_UNAVAILABLE_MESSAGE,
      square: setup,
    },
  })
})

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
