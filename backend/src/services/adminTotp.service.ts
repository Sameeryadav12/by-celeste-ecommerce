import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { encryptTotpSecret, decryptTotpSecret } from '../utils/totpFieldCrypto'
import { verifyPassword } from '../utils/password'

const TOTP_ISSUER = 'By Celeste'

authenticator.options = { window: 1 }

export type TotpSetupStartResult = {
  qrDataUrl: string
  otpauthUrl: string
  /** True when completing a previously started setup (same secret as before). */
  resumedPending: boolean
}

export async function getAdminTotpStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, totpEnabled: true, totpSecretEncrypted: true },
  })
  if (!user || user.role !== 'ADMIN') {
    throw new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Admin only.' })
  }
  return {
    totpEnabled: user.totpEnabled,
    totpEnrollmentPending: Boolean(user.totpSecretEncrypted && !user.totpEnabled),
  }
}

export async function startAdminTotpSetup(userId: string): Promise<TotpSetupStartResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, totpEnabled: true, totpSecretEncrypted: true },
  })
  if (!user || user.role !== 'ADMIN') {
    throw new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Admin only.' })
  }
  if (user.totpEnabled) {
    throw new ApiError({
      statusCode: 400,
      code: 'TOTP_ALREADY_ENABLED',
      message: 'Two-factor authentication is already enabled. Disable it first to re-enroll.',
    })
  }

  let secret: string
  let resumedPending = false
  if (user.totpSecretEncrypted) {
    secret = decryptTotpSecret(user.totpSecretEncrypted)
    resumedPending = true
  } else {
    secret = authenticator.generateSecret()
    const encrypted = encryptTotpSecret(secret)
    await prisma.user.update({
      where: { id: userId },
      data: { totpSecretEncrypted: encrypted, totpEnabled: false },
    })
  }

  const otpauthUrl = authenticator.keyuri(user.email, TOTP_ISSUER, secret)
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 })

  return { qrDataUrl, otpauthUrl, resumedPending }
}

export async function verifyAndEnableAdminTotp(userId: string, code: string) {
  const normalized = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(normalized)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_TOTP_CODE',
      message: 'Enter the 6-digit code from your authenticator app.',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, totpEnabled: true, totpSecretEncrypted: true },
  })
  if (!user || user.role !== 'ADMIN') {
    throw new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Admin only.' })
  }
  if (user.totpEnabled) {
    throw new ApiError({
      statusCode: 400,
      code: 'TOTP_ALREADY_ENABLED',
      message: 'Two-factor authentication is already enabled.',
    })
  }
  if (!user.totpSecretEncrypted) {
    throw new ApiError({
      statusCode: 400,
      code: 'TOTP_SETUP_NOT_STARTED',
      message: 'Start setup first to show the QR code.',
    })
  }

  const secret = decryptTotpSecret(user.totpSecretEncrypted)
  const ok = authenticator.verify({ token: normalized, secret })
  if (!ok) {
    throw new ApiError({
      statusCode: 400,
      code: 'TOTP_VERIFY_FAILED',
      message: 'That code did not match. Check the clock on your phone and try a new code.',
    })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: true },
  })
}

export async function disableAdminTotp(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, passwordHash: true },
  })
  if (!user || user.role !== 'ADMIN') {
    throw new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Admin only.' })
  }

  const pwOk = await verifyPassword(password, user.passwordHash)
  if (!pwOk) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_PASSWORD',
      message: 'Password is incorrect.',
    })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: false, totpSecretEncrypted: null },
  })
}

export async function verifyAdminTotpForLogin(userId: string, code: string) {
  const normalized = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(normalized)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_TOTP_CODE',
      message: 'Enter the 6-digit code from your authenticator app.',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, totpEnabled: true, totpSecretEncrypted: true },
  })
  if (!user || user.role !== 'ADMIN' || !user.totpEnabled || !user.totpSecretEncrypted) {
    throw new ApiError({
      statusCode: 400,
      code: 'TOTP_NOT_REQUIRED',
      message: 'Two-factor authentication is not active for this account.',
    })
  }

  const secret = decryptTotpSecret(user.totpSecretEncrypted)
  const ok = authenticator.verify({ token: normalized, secret })
  if (!ok) {
    throw new ApiError({
      statusCode: 401,
      code: 'TOTP_VERIFY_FAILED',
      message: 'Invalid authenticator code.',
    })
  }
}
