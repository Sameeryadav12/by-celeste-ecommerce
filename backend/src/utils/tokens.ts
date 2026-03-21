import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Response } from 'express'
import { env } from '../config/env'

export type AccessTokenPayload = {
  sub: string
  email: string
  role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'
}

export function signAccessToken(payload: AccessTokenPayload) {
  const options: SignOptions = {
    // jsonwebtoken typings use `ms.StringValue`; env string is valid at runtime
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options)
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
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

