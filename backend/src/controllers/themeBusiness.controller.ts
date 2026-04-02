import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { getThemeSettings, updateThemeSettings } from '../services/themeSettings.service'
import { getBusinessSettings, updateBusinessSettings } from '../services/businessSettings.service'

export const publicGetThemeSettings = asyncHandler(async (_req: Request, res: Response) => {
  const theme = await getThemeSettings()
  res.json({ success: true, data: { theme } })
})

export const adminGetThemeSettings = asyncHandler(async (_req: Request, res: Response) => {
  const theme = await getThemeSettings()
  res.json({ success: true, data: { theme } })
})

export const adminUpdateThemeSettings = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Parameters<typeof updateThemeSettings>[0]
  const theme = await updateThemeSettings(body)
  res.json({ success: true, data: { theme } })
})

export const publicGetBusinessSettings = asyncHandler(async (_req: Request, res: Response) => {
  const business = await getBusinessSettings()
  res.json({ success: true, data: { business } })
})

export const adminGetBusinessSettings = asyncHandler(async (_req: Request, res: Response) => {
  const business = await getBusinessSettings()
  res.json({ success: true, data: { business } })
})

export const adminUpdateBusinessSettings = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Parameters<typeof updateBusinessSettings>[0]
  const business = await updateBusinessSettings(body)
  res.json({ success: true, data: { business } })
})
