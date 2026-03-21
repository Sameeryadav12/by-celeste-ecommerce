import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { processSquareWebhookRequest } from '../services/squareWebhook.service'

export const postSquareWebhook = asyncHandler(async (req: Request, res: Response) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body ?? '')
  const sigHeader = req.headers['x-square-hmacsha256-signature']
  const signatureHeader = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader

  const status = await processSquareWebhookRequest({
    rawBody,
    signatureHeader,
  })

  res.status(status).send()
})
