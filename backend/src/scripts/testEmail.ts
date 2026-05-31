import 'dotenv/config'
import { env } from '../config/env'
import { isMailConfigured, sendMail } from '../services/mail.service'

/**
 * Local smoke test for the SMTP integration:
 *   npm run test:email
 * Sends a single plain-text message to ADMIN_NOTIFICATION_EMAIL using the configured Brevo relay.
 * Never runs in production unless explicitly invoked.
 */
async function main() {
  if (!isMailConfigured()) {
    console.error(
      'SMTP is not configured. Set SMTP_USER, SMTP_PASS, and MAIL_FROM_EMAIL in .env, then re-run.',
    )
    process.exitCode = 1
    return
  }

  const recipient = env.ADMIN_NOTIFICATION_EMAIL || env.MAIL_FROM_EMAIL
  if (!recipient) {
    console.error('No recipient — set ADMIN_NOTIFICATION_EMAIL (or MAIL_FROM_EMAIL) in .env.')
    process.exitCode = 1
    return
  }

  console.log(`Sending test email to ${recipient} via ${env.SMTP_HOST}:${env.SMTP_PORT} …`)

  const result = await sendMail({
    to: recipient,
    subject: 'By Celeste — SMTP test',
    text:
      'This is a test message from the By Celeste backend.\n\n' +
      'If you received this, the Brevo SMTP relay is configured correctly.\n\n— By Celeste backend',
    html:
      '<p>This is a test message from the <strong>By Celeste</strong> backend.</p>' +
      '<p>If you received this, the Brevo SMTP relay is configured correctly.</p>' +
      '<p style="color:#666;font-size:12px;">— By Celeste backend</p>',
  })

  if (result.sent) {
    console.log(`OK — message accepted (id=${result.messageId ?? 'n/a'}).`)
  } else {
    console.error(`FAILED — reason=${result.reason}${'error' in result ? ` error=${result.error}` : ''}`)
    process.exitCode = 1
  }
}

void main()
