import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'

export type AdminCouponInput = {
  code: string
  percentage: number
  isActive?: boolean
  appliesToCustomers?: boolean
  appliesToWholesale?: boolean
  startsAt?: Date | null
  endsAt?: Date | null
  totalUsageLimit?: number | null
  perCustomerLimit?: number | null
}

function couponShape() {
  return {
    id: true,
    code: true,
    percentage: true,
    isActive: true,
    appliesToCustomers: true,
    appliesToWholesale: true,
    startsAt: true,
    endsAt: true,
    totalUsageLimit: true,
    perCustomerLimit: true,
    usedCount: true,
    createdAt: true,
    updatedAt: true,
  } as const
}

export type AdminCouponDto = {
  id: string
  code: string
  percentage: number
  isActive: boolean
  appliesToCustomers: boolean
  appliesToWholesale: boolean
  startsAt: string | null
  endsAt: string | null
  totalUsageLimit: number | null
  perCustomerLimit: number | null
  usedCount: number
  createdAt: string
  updatedAt: string
}

function toDto(c: {
  id: string
  code: string
  percentage: number
  isActive: boolean
  appliesToCustomers: boolean
  appliesToWholesale: boolean
  startsAt: Date | null
  endsAt: Date | null
  totalUsageLimit: number | null
  perCustomerLimit: number | null
  usedCount: number
  createdAt: Date
  updatedAt: Date
}): AdminCouponDto {
  return {
    id: c.id,
    code: c.code,
    percentage: c.percentage,
    isActive: c.isActive,
    appliesToCustomers: c.appliesToCustomers,
    appliesToWholesale: c.appliesToWholesale,
    startsAt: c.startsAt ? c.startsAt.toISOString() : null,
    endsAt: c.endsAt ? c.endsAt.toISOString() : null,
    totalUsageLimit: c.totalUsageLimit,
    perCustomerLimit: c.perCustomerLimit,
    usedCount: c.usedCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export async function adminListCoupons(): Promise<AdminCouponDto[]> {
  const rows = await prisma.discountCoupon.findMany({
    orderBy: { createdAt: 'desc' },
    select: couponShape(),
  })
  return rows.map(toDto)
}

export async function adminGetCoupon(id: string): Promise<AdminCouponDto> {
  const row = await prisma.discountCoupon.findUnique({
    where: { id },
    select: couponShape(),
  })
  if (!row) {
    throw new ApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' })
  }
  return toDto(row)
}

export async function adminCreateCoupon(input: AdminCouponInput): Promise<AdminCouponDto> {
  try {
    const row = await prisma.discountCoupon.create({
      data: {
        code: input.code,
        percentage: input.percentage,
        isActive: input.isActive ?? true,
        appliesToCustomers: input.appliesToCustomers ?? true,
        appliesToWholesale: input.appliesToWholesale ?? false,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        totalUsageLimit: input.totalUsageLimit ?? null,
        perCustomerLimit: input.perCustomerLimit ?? 1,
      },
      select: couponShape(),
    })
    return toDto(row)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ApiError({
        statusCode: 409,
        code: 'COUPON_CODE_TAKEN',
        message: 'A coupon with this code already exists. Choose a different code.',
      })
    }
    throw e
  }
}

export async function adminUpdateCoupon(
  id: string,
  input: Partial<AdminCouponInput>,
): Promise<AdminCouponDto> {
  const existing = await prisma.discountCoupon.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' })
  }

  try {
    const row = await prisma.discountCoupon.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.percentage !== undefined ? { percentage: input.percentage } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.appliesToCustomers !== undefined
          ? { appliesToCustomers: input.appliesToCustomers }
          : {}),
        ...(input.appliesToWholesale !== undefined
          ? { appliesToWholesale: input.appliesToWholesale }
          : {}),
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.totalUsageLimit !== undefined ? { totalUsageLimit: input.totalUsageLimit } : {}),
        ...(input.perCustomerLimit !== undefined
          ? { perCustomerLimit: input.perCustomerLimit }
          : {}),
      },
      select: couponShape(),
    })
    return toDto(row)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ApiError({
        statusCode: 409,
        code: 'COUPON_CODE_TAKEN',
        message: 'A coupon with this code already exists. Choose a different code.',
      })
    }
    throw e
  }
}

export async function adminDeleteCoupon(id: string): Promise<void> {
  const existing = await prisma.discountCoupon.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({ statusCode: 404, code: 'COUPON_NOT_FOUND', message: 'Coupon not found.' })
  }
  await prisma.discountCoupon.delete({ where: { id } })
}
