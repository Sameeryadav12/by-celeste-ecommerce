import type { Role } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { hashPassword, verifyPassword } from '../utils/password'
import { LOYALTY_EARN_RULE_SUMMARY } from './loyalty.service'
import {
  getSafeUserById as getSafeUserByIdFromAuth,
  type SafeUser,
} from './auth.service'
import { accountPasswordPatchSchema, accountProfilePatchSchema } from './accountProfile.validation'

function moneyString(d: { toString(): string }) {
  return d.toString()
}

export async function listOrdersForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  })

  return orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalAmount: moneyString(o.totalAmount),
    itemCount: o._count.items,
  }))
}

export async function getOrderDetailForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          productSlugSnapshot: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  })

  if (!order) {
    throw new ApiError({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
      message: 'We could not find that order on your account.',
    })
  }

  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalAmount: moneyString(order.subtotalAmount),
    shippingAmount: moneyString(order.shippingAmount),
    totalAmount: moneyString(order.totalAmount),
    customer: {
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
    },
    shipping: {
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      suburb: order.suburb,
      state: order.state,
      postcode: order.postcode,
      country: order.country,
    },
    notes: order.notes,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.productNameSnapshot,
      slug: i.productSlugSnapshot,
      unitPrice: moneyString(i.unitPrice),
      quantity: i.quantity,
      lineTotal: moneyString(i.lineTotal),
    })),
  }
}

export async function getLoyaltyDashboardForUser(userId: string) {
  const [user, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPointsBalance: true },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        pointsChange: true,
        description: true,
        orderId: true,
        createdAt: true,
      },
    }),
  ])

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
      message: 'Account not found.',
    })
  }

  return {
    balance: user.loyaltyPointsBalance,
    howPointsAreEarned: LOYALTY_EARN_RULE_SUMMARY,
    recentTransactions: recent.map((t) => ({
      id: t.id,
      type: t.type,
      pointsChange: t.pointsChange,
      description: t.description,
      orderId: t.orderId,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export async function getSafeUserById(userId: string) {
  return getSafeUserByIdFromAuth(userId)
}

export async function updateAccountProfile(
  userId: string,
  role: Role,
  body: unknown,
): Promise<{ user: SafeUser; emailChanged: boolean }> {
  if (role === 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Admin profiles cannot be edited here.',
    })
  }

  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!before) {
    throw new ApiError({ statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' })
  }

  const parsed = accountProfilePatchSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check your profile fields.',
      details: parsed.error.flatten(),
    })
  }

  const data = parsed.data

  if (role === 'WHOLESALE') {
    const bn = data.businessName?.trim()
    if (!bn || bn.length < 2) {
      throw new ApiError({
        statusCode: 400,
        code: 'BUSINESS_NAME_REQUIRED',
        message: 'Business name is required for wholesale accounts.',
      })
    }
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: data.email, NOT: { id: userId } },
    select: { id: true },
  })
  if (emailTaken) {
    throw new ApiError({
      statusCode: 409,
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'That login email is already in use.',
    })
  }

  if (data.contactEmail) {
    const clash = await prisma.user.findFirst({
      where: {
        email: data.contactEmail,
        NOT: { id: userId },
      },
      select: { id: true },
    })
    if (clash) {
      throw new ApiError({
        statusCode: 409,
        code: 'CONTACT_EMAIL_IN_USE',
        message: 'That contact email matches another account login.',
      })
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data:
      role === 'WHOLESALE'
        ? {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contactEmail: data.contactEmail ?? null,
            businessName: data.businessName!.trim(),
            abn: data.abn?.trim() ? data.abn.trim() : null,
          }
        : {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contactEmail: data.contactEmail ?? null,
          },
  })

  const user = await getSafeUserByIdFromAuth(userId)
  if (!user) {
    throw new ApiError({ statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' })
  }

  return { user, emailChanged: before.email !== data.email }
}

export async function updateAccountPassword(userId: string, body: unknown) {
  const parsed = accountPasswordPatchSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Please check your password fields.',
      details: parsed.error.flatten(),
    })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new ApiError({ statusCode: 404, code: 'USER_NOT_FOUND', message: 'Account not found.' })
  }

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash)
  if (!ok) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_PASSWORD',
      message: 'Current password is incorrect.',
    })
  }

  const passwordHash = await hashPassword(parsed.data.newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: { id: true },
  })

  return { ok: true as const }
}
