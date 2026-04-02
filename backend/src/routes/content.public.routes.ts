import { Router } from 'express'
import { publicGetMarketingContent } from '../controllers/marketingContent.controller'
import {
  publicGetBusinessSettings,
  publicGetThemeSettings,
} from '../controllers/themeBusiness.controller'

export const contentPublicRouter = Router()

contentPublicRouter.get('/marketing', publicGetMarketingContent)
contentPublicRouter.get('/theme', publicGetThemeSettings)
contentPublicRouter.get('/business', publicGetBusinessSettings)
