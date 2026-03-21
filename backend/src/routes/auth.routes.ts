import { Router } from 'express'
import { login, logout, me, signup, wholesaleApply } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/wholesale/apply', wholesaleApply)
authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)

