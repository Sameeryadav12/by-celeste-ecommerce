import { env } from '../config/env'

const REQUIRED_ENV = [
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
] as const

export function getAdminSquareReadiness() {
  const missingEnv: string[] = []
  if (!env.SQUARE_ACCESS_TOKEN?.trim()) missingEnv.push('SQUARE_ACCESS_TOKEN')
  if (!env.SQUARE_LOCATION_ID?.trim()) missingEnv.push('SQUARE_LOCATION_ID')
  if (!env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim()) missingEnv.push('SQUARE_WEBHOOK_SIGNATURE_KEY')

  return {
    connected: missingEnv.length === 0,
    missingEnv,
  }
}

export { REQUIRED_ENV }
