import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../config/env'

type MailRecipient = string | string[]

export type MailMessage = {
  to: MailRecipient
  subject: string
  text: string
  html?: string
  /** Optional Reply-To header (e.g. the wholesale applicant or customer email). */
  replyTo?: string
}

export type SendMailResult =
  | { sent: true; messageId: string | null }
  | { sent: false; reason: 'NOT_CONFIGURED' | 'ERROR'; error?: string }

/**
 * SMTP is optional: when `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM_EMAIL` are missing the service
 * acts as a no-op and callers fall back to safe behaviour (e.g. logging the password reset link
 * in dev). Never throws on send — failures are returned as `{ sent: false }`.
 */
export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM_EMAIL)
}

let cachedTransport: Transporter | null = null

function getTransport(): Transporter | null {
  if (!isMailConfigured()) return null
  if (cachedTransport) return cachedTransport
  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
  return cachedTransport
}

function fromHeader(): string {
  const name = env.MAIL_FROM_NAME || 'By Celeste'
  return env.MAIL_FROM_EMAIL ? `"${name}" <${env.MAIL_FROM_EMAIL}>` : name
}

/**
 * Generic transactional send. Logs the subject/recipient in dev only and never prints secrets.
 * Use the typed helpers below for production flows so subject lines stay consistent.
 */
export async function sendMail(message: MailMessage): Promise<SendMailResult> {
  const transport = getTransport()
  if (!transport) return { sent: false, reason: 'NOT_CONFIGURED' }

  try {
    const info = await transport.sendMail({
      from: fromHeader(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    })

    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[mail] sent "${message.subject}" to ${Array.isArray(message.to) ? message.to.join(', ') : message.to} (id=${info.messageId ?? 'n/a'})`)
    }

    return { sent: true, messageId: info.messageId ?? null }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown SMTP error'
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[mail] failed to send "${message.subject}": ${reason}`)
    }
    return { sent: false, reason: 'ERROR', error: reason }
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function brandedShell(bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f8f7f4;font-family:Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7f4;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e3df;">
        <tr><td style="padding:24px 28px 8px 28px;font-size:18px;font-weight:600;letter-spacing:0.4px;">By Celeste</td></tr>
        <tr><td style="padding:0 28px 24px 28px;font-size:14px;line-height:1.55;color:#222;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 28px 24px 28px;font-size:12px;color:#777;border-top:1px solid #efece6;">This is an automated message from By Celeste.</td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`
}

/* ─────────────────────────  Password reset  ───────────────────────── */

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
  ttlMinutes: number
}): Promise<SendMailResult> {
  const subject = 'Reset your By Celeste password'
  const text =
    `Hi,\n\nWe received a request to reset the password for your By Celeste account.\n\n` +
    `Reset link (valid for ${params.ttlMinutes} minutes):\n${params.resetUrl}\n\n` +
    `If you did not request this, you can safely ignore this email — your password will not change.\n\n— By Celeste`

  const html = brandedShell(
    `<p>Hi,</p>
     <p>We received a request to reset the password for your By Celeste account.</p>
     <p style="text-align:center;margin:20px 0;">
       <a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">Reset password</a>
     </p>
     <p style="font-size:12px;color:#666;">Or paste this link into your browser:<br><span style="word-break:break-all;color:#444;">${escapeHtml(params.resetUrl)}</span></p>
     <p>This link expires in ${params.ttlMinutes} minutes. If you did not request a reset, you can safely ignore this email — your password will not change.</p>`,
  )

  return sendMail({ to: params.to, subject, text, html })
}

/* ─────────────────────  Wholesale application alert  ───────────────────── */

export async function sendWholesaleApplicationAlert(params: {
  applicantName: string
  applicantEmail: string
  businessName: string
  abn?: string | null
  notes?: string | null
  adminReviewUrl: string
}): Promise<SendMailResult> {
  if (!env.ADMIN_NOTIFICATION_EMAIL) return { sent: false, reason: 'NOT_CONFIGURED' }

  const subject = 'New wholesale application - By Celeste'
  const lines = [
    `A new wholesale application was submitted on By Celeste.`,
    ``,
    `Applicant: ${params.applicantName}`,
    `Email: ${params.applicantEmail}`,
    `Business: ${params.businessName}`,
  ]
  if (params.abn) lines.push(`ABN: ${params.abn}`)
  if (params.notes) lines.push(`Notes:\n${params.notes}`)
  lines.push(``, `Review in admin: ${params.adminReviewUrl}`)

  const rowsHtml = [
    `<tr><td style="padding:4px 0;color:#666;width:120px;">Applicant</td><td style="padding:4px 0;">${escapeHtml(params.applicantName)}</td></tr>`,
    `<tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(params.applicantEmail)}" style="color:#111;">${escapeHtml(params.applicantEmail)}</a></td></tr>`,
    `<tr><td style="padding:4px 0;color:#666;">Business</td><td style="padding:4px 0;">${escapeHtml(params.businessName)}</td></tr>`,
    params.abn ? `<tr><td style="padding:4px 0;color:#666;">ABN</td><td style="padding:4px 0;">${escapeHtml(params.abn)}</td></tr>` : '',
    params.notes ? `<tr><td style="padding:4px 0;color:#666;vertical-align:top;">Notes</td><td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(params.notes)}</td></tr>` : '',
  ]
    .filter(Boolean)
    .join('')

  const html = brandedShell(
    `<p>A new wholesale application was submitted.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">${rowsHtml}</table>
     <p style="text-align:center;margin:20px 0;">
       <a href="${escapeHtml(params.adminReviewUrl)}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">Review in admin</a>
     </p>`,
  )

  return sendMail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject,
    text: lines.join('\n'),
    html,
    replyTo: params.applicantEmail,
  })
}

/* ─────────────────────────  Order alert  ───────────────────────── */

export type OrderNotificationItem = {
  name: string
  quantity: number
  /** Pre-formatted price string e.g. "$45.00" so the service never imports formatter logic. */
  price: string
}

export async function sendOrderNotificationEmail(params: {
  orderNumber: string
  customerName: string
  customerEmail: string
  totalFormatted: string
  paymentStatus: string
  orderStatus: string
  items: OrderNotificationItem[]
  adminOrderUrl: string
}): Promise<SendMailResult> {
  if (!env.ADMIN_NOTIFICATION_EMAIL) return { sent: false, reason: 'NOT_CONFIGURED' }

  const subject = `New order received - ${params.orderNumber}`
  const itemLines = params.items.map((item) => `  • ${item.quantity} × ${item.name} — ${item.price}`)
  const text = [
    `A new order has come through on By Celeste.`,
    ``,
    `Order: ${params.orderNumber}`,
    `Customer: ${params.customerName} <${params.customerEmail}>`,
    `Payment: ${params.paymentStatus}`,
    `Status: ${params.orderStatus}`,
    `Total: ${params.totalFormatted}`,
    ``,
    `Items:`,
    ...itemLines,
    ``,
    `Open in admin: ${params.adminOrderUrl}`,
  ].join('\n')

  const itemRowsHtml = params.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;">${item.quantity} × ${escapeHtml(item.name)}</td><td style="padding:4px 0;text-align:right;">${escapeHtml(item.price)}</td></tr>`,
    )
    .join('')

  const html = brandedShell(
    `<p>A new order has come through.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
       <tr><td style="padding:4px 0;color:#666;width:120px;">Order</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(params.orderNumber)}</td></tr>
       <tr><td style="padding:4px 0;color:#666;">Customer</td><td style="padding:4px 0;">${escapeHtml(params.customerName)}</td></tr>
       <tr><td style="padding:4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(params.customerEmail)}" style="color:#111;">${escapeHtml(params.customerEmail)}</a></td></tr>
       <tr><td style="padding:4px 0;color:#666;">Payment</td><td style="padding:4px 0;">${escapeHtml(params.paymentStatus)}</td></tr>
       <tr><td style="padding:4px 0;color:#666;">Status</td><td style="padding:4px 0;">${escapeHtml(params.orderStatus)}</td></tr>
       <tr><td style="padding:4px 0;color:#666;">Total</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(params.totalFormatted)}</td></tr>
     </table>
     <hr style="border:none;border-top:1px solid #efece6;margin:14px 0;" />
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">${itemRowsHtml}</table>
     <p style="text-align:center;margin:20px 0;">
       <a href="${escapeHtml(params.adminOrderUrl)}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">Open in admin</a>
     </p>`,
  )

  return sendMail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject,
    text,
    html,
    replyTo: params.customerEmail,
  })
}
