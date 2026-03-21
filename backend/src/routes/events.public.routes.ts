import { Router } from 'express'
import { getEventBySlugPublic, listEventsPublic } from '../controllers/events.public.controller'

export const eventsPublicRouter = Router()

eventsPublicRouter.get('/', listEventsPublic)
eventsPublicRouter.get('/:slug', getEventBySlugPublic)
