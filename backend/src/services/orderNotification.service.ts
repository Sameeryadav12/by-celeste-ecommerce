import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { formatOrderNumber } from '../utils/orderNumber'
import { sendOrderNotificationEmail } from './mail.service'

function formatAud(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (!Number.isFinite(value)) return '$0.00'
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value)
}

/**
 * Builds the admin "new paid order" alert and dispatches it. Safe to call multiple times — the
 * caller is responsible for de-dup (see `squareWebhook.service.ts`). Failures are swallowed and
 * logged in dev so a flaky SMTP relay never blocks payment processing.
 */
export async function sendOrderPaidAdminAlert(orderId: string): Promise<void> {
  if (!env.ADMIN_NOTIFICATION_EMAIL) return

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) return

  const adminBase = env.FRONTEND_PUBLIC_URL?.replace(/\/+$/, '') ?? ''
  try {
    await sendOrderNotificationEmail({
      orderNumber: formatOrderNumber(order.orderNumber),
      customerName: `${order.firstName} ${order.lastName}`.trim() || order.email,
      customerEmail: order.email,
      totalFormatted: formatAud(order.totalAmount.toString()),
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      items: order.items.map((item) => ({
        name: item.productNameSnapshot,
        quantity: item.quantity,
        price: formatAud(item.lineTotal.toString()),
      })),
      adminOrderUrl: `${adminBase}/admin/orders/${order.id}`,
    })
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[orderNotification] failed to send admin alert', error)
    }
  }
}
