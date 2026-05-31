import { createHash, randomBytes } from 'node:crypto'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { hashPassword } from '../utils/password'

/** Always returned to the public — never leaks whether the email exists. */
export const FORGOT_PASSWORD_SAFE_MESSAGE =
  'If an account exists for this email, a reset link will be sent.'

const RESET_TOKEN_BYTES = 32

export function hashResetToken(plain: string): string {
  return createHash('sha256').update(plain).digest('hex')
}

function buildResetUrl(token: string): string {
  const base = env.PASSWORD_RESET_LINK_BASE || 'http://localhost:5174'
  const cleaned = base.replace(/\/+$/, '')
  return `${cleaned}/reset-password?token=${encodeURIComponent(token)}`
}

/**
 * Creates a one-time password reset token for the email if a matching account exists. Returns
 * `{ delivered }` so the caller can log/email the link without exposing whether the email exists
 * to the public response.
 */
export async function createPasswordResetForEmail(emailRaw: string): Promise<{
  delivered: boolean
  /** Plaintext URL — only ever log this in development; never return it to public API. */
  resetUrl: string | null
}> {
  const email = emailRaw.trim().toLowerCase()
  if (!email) return { delivered: false, resetUrl: null }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  })

  if (!user || !user.isActive) {
    return { delivered: false, resetUrl: null }
  }

  // Invalidate any previous unused tokens so only the latest link works.
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  })

  const plain = randomBytes(RESET_TOKEN_BYTES).toString('base64url')
  const tokenHash = hashResetToken(plain)
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MIN * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  return { delivered: true, resetUrl: buildResetUrl(plain) }
}

/**
 * Validates the token, rotates the user's password hash, and marks the token as used. Existing
 * 2FA settings are preserved — a password reset must not disable an admin's authenticator.
 */
export async function consumePasswordResetToken(params: {
  token: string
  newPassword: string
}): Promise<void> {
  const tokenHash = hashResetToken(params.token.trim())
  if (!tokenHash) {
    throw new ApiError({
      statusCode: 400,
      code: 'RESET_TOKEN_INVALID',
      message: 'This reset link is invalid or has already been used. Please request a new one.',
    })
  }

  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  const now = new Date()
  if (!token || token.usedAt || token.expiresAt < now) {
    throw new ApiError({
      statusCode: 400,
      code: 'RESET_TOKEN_INVALID',
      message: 'This reset link is invalid or has expired. Please request a new one.',
    })
  }

  const passwordHash = await hashPassword(params.newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash },
      // Do NOT touch totpEnabled / totpSecretEncrypted — admin 2FA must survive a password reset.
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    }),
    // Burn any other live tokens for this user so old links cannot be reused after a successful reset.
    prisma.passwordResetToken.updateMany({
      where: {
        userId: token.userId,
        id: { not: token.id },
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { expiresAt: now },
    }),
  ])
}
