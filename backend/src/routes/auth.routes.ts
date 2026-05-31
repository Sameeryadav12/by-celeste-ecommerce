import { Router } from 'express'
import {
  forgotPassword,
  login,
  loginTotp,
  logout,
  me,
  resetPassword,
  signup,
  wholesaleApply,
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/wholesale/apply', wholesaleApply)
authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/login/totp', loginTotp)
authRouter.post('/logout', logout)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)
authRouter.get('/me', requireAuth, me)
