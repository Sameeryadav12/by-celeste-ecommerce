import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { getAdminSummary } from '../services/adminSummary.service'

export const getAdminSummaryHandler = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getAdminSummary()
  res.json({ success: true, data: summary })
})

