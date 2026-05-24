import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Response } from 'express'
import { env } from '../config/env'

export type AccessTokenPayload = {
  sub: string
  email: string
  role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'
}

export type TwoFactorPendingPayload = {
  step: 'totp_pending'
  sub: string
  email: string
  role: 'ADMIN'
}

export function signAccessToken(payload: AccessTokenPayload) {
  const options: SignOptions = {
    // jsonwebtoken typings use `ms.StringValue`; env string is valid at runtime
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options)
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & { step?: string }
  if (decoded.step === 'totp_pending') {
    throw new jwt.JsonWebTokenError('Invalid access token')
  }
  return decoded as AccessTokenPayload
}

export function signTwoFactorPendingToken(payload: { sub: string; email: string }) {
  const body: TwoFactorPendingPayload = {
    step: 'totp_pending',
    sub: payload.sub,
    email: payload.email,
    role: 'ADMIN',
  }
  return jwt.sign(body, env.JWT_ACCESS_SECRET, { expiresIn: '5m' })
}

export function verifyTwoFactorPendingToken(token: string): TwoFactorPendingPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TwoFactorPendingPayload & { step?: string }
  if (decoded.step !== 'totp_pending' || decoded.role !== 'ADMIN') {
    throw new Error('Invalid two-factor token')
  }
  return decoded
}

export function setAuthCookie(res: Response, token: string) {
  const maxAgeMs = env.AUTH_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

  res.cookie(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAMESITE,
    domain: env.AUTH_COOKIE_DOMAIN,
    maxAge: maxAgeMs,
    path: '/',
  })
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAMESITE,
    domain: env.AUTH_COOKIE_DOMAIN,
    path: '/',
  })
}

