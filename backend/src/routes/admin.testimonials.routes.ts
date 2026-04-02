import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminCreateTestimonial,
  adminDeleteTestimonial,
  adminListTestimonials,
  adminUpdateTestimonial,
} from '../controllers/testimonials.controller'

export const adminTestimonialsRouter = Router()

adminTestimonialsRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminTestimonialsRouter.get('/', adminListTestimonials)
adminTestimonialsRouter.post('/', adminCreateTestimonial)
adminTestimonialsRouter.put('/:id', adminUpdateTestimonial)
adminTestimonialsRouter.delete('/:id', adminDeleteTestimonial)
