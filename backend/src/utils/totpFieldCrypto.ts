import crypto from 'node:crypto'
import { env } from '../config/env'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16

function totpEncryptionKey(): Buffer {
  if (env.TOTP_ENCRYPTION_KEY) {
    const hex = env.TOTP_ENCRYPTION_KEY.replace(/\s+/g, '')
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error('TOTP_ENCRYPTION_KEY must be 64 hex characters (32 bytes).')
    }
    return Buffer.from(hex, 'hex')
  }
  return crypto.createHash('sha256').update(`${env.JWT_ACCESS_SECRET}:by-celeste-totp-v1`).digest()
}

export function encryptTotpSecret(plainSecret: string): string {
  const iv = crypto.randomBytes(IV_LEN)
  const key = totpEncryptionKey()
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN })
  const enc = Buffer.concat([cipher.update(plainSecret, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptTotpSecret(blob: string): string {
  const buf = Buffer.from(blob, 'base64')
  if (buf.length < IV_LEN + TAG_LEN + 1) {
    throw new Error('Invalid encrypted TOTP payload.')
  }
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const enc = buf.subarray(IV_LEN + TAG_LEN)
  const decipher = crypto.createDecipheriv(ALGO, totpEncryptionKey(), iv, { authTagLength: TAG_LEN })
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}
