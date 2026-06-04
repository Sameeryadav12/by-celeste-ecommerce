import { env } from '../config/env'
import { isSquareConfigured, isSquareWebhookConfigured } from '../services/squareClient'

const REQUIRED_ENV = [
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
] as const

export function getAdminSquareReadiness() {
  const missingEnv: string[] = []
  if (!isSquareConfigured()) {
    missingEnv.push('SQUARE_ACCESS_TOKEN')
    missingEnv.push('SQUARE_LOCATION_ID')
  }
  if (!isSquareWebhookConfigured()) {
    missingEnv.push('SQUARE_WEBHOOK_SIGNATURE_KEY')
    if (!env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim()) {
      missingEnv.push('SQUARE_WEBHOOK_NOTIFICATION_URL')
    }
  }

  return {
    connected: isSquareConfigured() && isSquareWebhookConfigured(),
    missingEnv,
  }
}

export { REQUIRED_ENV }
