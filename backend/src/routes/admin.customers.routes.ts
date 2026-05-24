import { Router } from 'express'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth.middleware'
import {
  adminExportCustomers,
  adminGetCustomer,
  adminListCustomers,
  adminUpdateCustomerNotes,
  adminUpdateCustomerStatus,
} from '../controllers/admin.customers.controller'

export const adminCustomersRouter = Router()

adminCustomersRouter.use(requireAuth, requireRole([Role.ADMIN]))

adminCustomersRouter.get('/', adminListCustomers)
adminCustomersRouter.get('/export', adminExportCustomers)
adminCustomersRouter.get('/:id', adminGetCustomer)
adminCustomersRouter.put('/:id/notes', adminUpdateCustomerNotes)
adminCustomersRouter.put('/:id/status', adminUpdateCustomerStatus)
