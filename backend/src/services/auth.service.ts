import type { Role, User } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { hashPassword, verifyPassword } from '../utils/password'

export type SafeUser = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'role'
  | 'isActive'
  | 'loyaltyPointsBalance'
  | 'wholesaleApprovalStatus'
  | 'businessName'
  | 'abn'
  | 'approvedAt'
  | 'createdAt'
  | 'updatedAt'
>

function toSafeUser(user: User): SafeUser {
  // Never return passwordHash to the client
  const { passwordHash: _pw, ...safe } = user
  return safe
}

export async function createUserAsPublicSignup(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: Role | 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new ApiError({
      statusCode: 409,
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'That email is already in use. Please log in instead.',
    })
  }

  // Public signup rules:
  // - Default role: CUSTOMER
  // - ADMIN is never allowed via public signup
  // - WHOLESALE uses the dedicated application flow (`POST /api/auth/wholesale/apply`)
  const requestedRole = input.role ?? 'CUSTOMER'
  if (requestedRole === 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      code: 'ROLE_NOT_ALLOWED',
      message: 'Admin accounts cannot be created using public signup.',
    })
  }
  if (requestedRole === 'WHOLESALE') {
    throw new ApiError({
      statusCode: 403,
      code: 'WHOLESALE_USE_APPLICATION',
      message:
        'Wholesale accounts use the application form on the Wholesale page, not the retail signup form.',
    })
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
    },
  })

  return toSafeUser(user)
}

/** Creates a WHOLESALE account pending staff approval (Step 9). */
export async function createWholesaleApplicationUser(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  businessName: string
  abn?: string
  wholesaleNotes?: string
}) {
  const email = input.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ApiError({
      statusCode: 409,
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'That email is already in use. Please log in instead.',
    })
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
      role: 'WHOLESALE',
      isActive: true,
      wholesaleApprovalStatus: 'PENDING',
      businessName: input.businessName.trim(),
      abn: input.abn?.trim() || null,
      wholesaleNotes: input.wholesaleNotes?.trim() || null,
    },
  })

  return toSafeUser(user)
}

export async function authenticateUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.',
    })
  }

  if (!user.isActive) {
    throw new ApiError({
      statusCode: 403,
      code: 'ACCOUNT_INACTIVE',
      message: 'This account is inactive. Please contact support.',
    })
  }

  const ok = await verifyPassword(input.password, user.passwordHash)
  if (!ok) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.',
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: { id: true },
  })

  return toSafeUser(user)
}

export async function getSafeUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null
  return toSafeUser(user)
}

