import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminCreateEvent,
  adminDeleteEvent,
  adminListEvents,
  adminUpdateEvent,
} from '../controllers/admin.events.controller'

export const adminEventsRouter = Router()

adminEventsRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminEventsRouter.get('/', adminListEvents)
adminEventsRouter.post('/', adminCreateEvent)
adminEventsRouter.put('/:id', adminUpdateEvent)
adminEventsRouter.delete('/:id', adminDeleteEvent)
