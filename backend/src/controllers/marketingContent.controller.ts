import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { getMarketingContent, updateMarketingContent } from '../services/marketingContent.service'

export const publicGetMarketingContent = asyncHandler(async (_req: Request, res: Response) => {
  const marketing = await getMarketingContent()
  res.json({ success: true, data: { marketing } })
})

export const adminGetMarketingContent = asyncHandler(async (_req: Request, res: Response) => {
  const marketing = await getMarketingContent()
  res.json({ success: true, data: { marketing } })
})

export const adminUpdateMarketingContent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Parameters<typeof updateMarketingContent>[0]
  const marketing = await updateMarketingContent(body)
  res.json({ success: true, data: { marketing } })
})
