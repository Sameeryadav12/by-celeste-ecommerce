import { Prisma, type DiscountCoupon } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'

const PERCENT_HUNDRED = new Prisma.Decimal(100)

export type CouponEligibilityContext = {
  isWholesale: boolean
  userId?: string | null
  email?: string | null
}

export type AppliedCoupon = {
  id: string
  code: string
  percentage: number
  discountAmount: Prisma.Decimal
  subtotalAfterDiscount: Prisma.Decimal
}

export function normaliseCouponCode(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

function couponNotFound(): never {
  throw new ApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' })
}

function couponInactive(): never {
  throw new ApiError({ statusCode: 400, code: 'COUPON_INACTIVE', message: 'Coupon is inactive.' })
}

function couponExpired(): never {
  throw new ApiError({ statusCode: 400, code: 'COUPON_EXPIRED', message: 'Coupon has expired.' })
}

function couponNotYetActive(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_NOT_YET_ACTIVE',
    message: 'Coupon is not active yet.',
  })
}

function couponLimitReached(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_LIMIT_REACHED',
    message: 'Coupon usage limit reached.',
  })
}

function couponAlreadyUsedByUser(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_ALREADY_USED',
    message: 'You have already used this coupon.',
  })
}

function couponNotForWholesale(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_NOT_FOR_WHOLESALE',
    message: 'This coupon is not available for wholesale orders.',
  })
}

function couponNotForCustomers(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_NOT_FOR_CUSTOMERS',
    message: 'This coupon is not available for retail customer orders.',
  })
}

function subtotalTooLow(): never {
  throw new ApiError({
    statusCode: 400,
    code: 'COUPON_SUBTOTAL_TOO_LOW',
    message: 'Add items to your cart before applying a coupon.',
  })
}

/** Loads the coupon and runs static + audience + window + limit checks. */
export async function evaluateCouponForUse(params: {
  code: string
  subtotal: Prisma.Decimal
  ctx: CouponEligibilityContext
}): Promise<AppliedCoupon> {
  const code = normaliseCouponCode(params.code)
  if (!code) couponNotFound()

  if (params.subtotal.lte(0)) subtotalTooLow()

  const coupon = await prisma.discountCoupon.findUnique({ where: { code } })
  if (!coupon) couponNotFound()
  if (!coupon.isActive) couponInactive()

  const now = new Date()
  if (coupon.startsAt && now < coupon.startsAt) couponNotYetActive()
  if (coupon.endsAt && now > coupon.endsAt) couponExpired()

  if (params.ctx.isWholesale && !coupon.appliesToWholesale) couponNotForWholesale()
  if (!params.ctx.isWholesale && !coupon.appliesToCustomers) couponNotForCustomers()

  if (coupon.totalUsageLimit != null && coupon.usedCount >= coupon.totalUsageLimit) {
    couponLimitReached()
  }

  if (coupon.perCustomerLimit != null && coupon.perCustomerLimit > 0) {
    const previousForUser = await countPreviousUsesForCustomer(coupon.id, params.ctx)
    if (previousForUser >= coupon.perCustomerLimit) couponAlreadyUsedByUser()
  }

  return computeAppliedCoupon(coupon, params.subtotal)
}

function computeAppliedCoupon(coupon: DiscountCoupon, subtotal: Prisma.Decimal): AppliedCoupon {
  const percentage = coupon.percentage
  const rawDiscount = subtotal.mul(percentage).div(PERCENT_HUNDRED)
  // Always round to 2 decimal places and never let discount exceed subtotal.
  let discountAmount = new Prisma.Decimal(rawDiscount.toFixed(2))
  if (discountAmount.gt(subtotal)) discountAmount = subtotal
  const subtotalAfterDiscount = subtotal.sub(discountAmount)
  return {
    id: coupon.id,
    code: coupon.code,
    percentage,
    discountAmount,
    subtotalAfterDiscount,
  }
}

async function countPreviousUsesForCustomer(couponId: string, ctx: CouponEligibilityContext) {
  if (ctx.userId) {
    return prisma.discountCouponUsage.count({
      where: { couponId, userId: ctx.userId },
    })
  }
  const email = ctx.email?.trim().toLowerCase()
  if (email) {
    return prisma.discountCouponUsage.count({
      where: { couponId, email },
    })
  }
  return 0
}

/**
 * Records a successful redemption against a paid order. Safe to call repeatedly: the unique
 * `(couponId, orderId)` index prevents double counting if Square retries the webhook.
 */
export async function recordCouponUsageForPaidOrder(params: {
  orderId: string
}): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      id: true,
      couponCode: true,
      userId: true,
      email: true,
    },
  })
  if (!order?.couponCode) return

  const code = normaliseCouponCode(order.couponCode)
  const coupon = await prisma.discountCoupon.findUnique({ where: { code } })
  if (!coupon) return

  try {
    await prisma.$transaction(async (tx) => {
      await tx.discountCouponUsage.create({
        data: {
          couponId: coupon.id,
          orderId: order.id,
          userId: order.userId ?? null,
          email: order.email?.toLowerCase() ?? null,
        },
      })
      await tx.discountCoupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      })
    })
  } catch (e) {
    // P2002 → usage already recorded for this order (webhook retry); ignore silently.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return
    throw e
  }
}
