import { Router } from 'express'
import { publicListTestimonials } from '../controllers/testimonials.controller'

export const testimonialsRouter = Router()

testimonialsRouter.get('/', publicListTestimonials)
