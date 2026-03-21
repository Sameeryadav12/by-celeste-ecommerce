import { Router } from 'express'
import { postSquareWebhook } from '../controllers/square.webhook.controller'

export const squareWebhookRouter = Router()

squareWebhookRouter.post('/', postSquareWebhook)
