import 'dotenv/config'
import { OrderPaymentStatus, OrderStatus, PaymentRecordStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { allocateOrderNumber } from '../services/orderNumber.service'
import { formatOrderNumber } from '../utils/orderNumber'

const DEMO_ORDER_NOTE = 'DEMO_SEED_PAID_ORDER'

/** One paid demo order for admin UI — idempotent, does not touch Square. */
export async function runDemoPaidOrderSeed() {
  const existing = await prisma.order.findFirst({
    where: { notes: DEMO_ORDER_NOTE, paymentStatus: OrderPaymentStatus.PAID },
  })
  if (existing) {
    if (existing.status !== OrderStatus.CONFIRMED) {
      await prisma.order.update({
        where: { id: existing.id },
        data: { status: OrderStatus.CONFIRMED },
      })
    }
    // eslint-disable-next-line no-console
    console.log(
      `[seedDemoPaidOrder] Demo paid order already exists: ${formatOrderNumber(existing.orderNumber)}`,
    )
    return
  }

  const product = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  if (!product) {
    // eslint-disable-next-line no-console
    console.log('[seedDemoPaidOrder] Skipped — no active products in catalogue.')
    return
  }

  const demoEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'customer@byceleste.com').trim().toLowerCase()
  const demoUser = await prisma.user.findUnique({ where: { email: demoEmail } })

  const qty = 1
  const unit = product.price
  const lineTotal = unit.mul(qty)
  const shipping = new Prisma.Decimal('12.00')
  const subtotal = lineTotal
  const total = subtotal.add(shipping)

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await allocateOrderNumber(tx)
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: demoUser?.id ?? null,
        email: demoEmail,
        firstName: demoUser?.firstName ?? 'Demo',
        lastName: demoUser?.lastName ?? 'Customer',
        phone: '0400000000',
        addressLine1: '1 Demo Street',
        suburb: 'Wodonga',
        state: 'VIC',
        postcode: '3690',
        country: 'Australia',
        notes: DEMO_ORDER_NOTE,
        subtotalAmount: subtotal,
        shippingAmount: shipping,
        totalAmount: total,
        status: OrderStatus.CONFIRMED,
        paymentStatus: OrderPaymentStatus.PAID,
      },
    })

    await tx.orderItem.create({
      data: {
        orderId: created.id,
        productId: product.id,
        productNameSnapshot: product.name,
        productSlugSnapshot: product.slug,
        unitPrice: unit,
        quantity: qty,
        lineTotal,
      },
    })

    await tx.orderPayment.create({
      data: {
        orderId: created.id,
        provider: 'DEMO',
        providerReference: `demo-${formatOrderNumber(orderNumber)}`,
        status: PaymentRecordStatus.PAID,
        amount: total,
      },
    })

    return created
  })

  // eslint-disable-next-line no-console
  console.log(`[seedDemoPaidOrder] Created demo paid order: ${formatOrderNumber(order.orderNumber)}`)
}

async function main() {
  try {
    await runDemoPaidOrderSeed()
  } finally {
    await prisma.$disconnect()
  }
}

const isCli = /seedDemoPaidOrder\.(ts|js)$/.test((process.argv[1] ?? '').replace(/\\/g, '/'))
if (isCli) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
