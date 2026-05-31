import { z } from 'zod/v3'

const CODE_REGEX = /^[A-Z0-9_-]{3,40}$/

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .transform((v) => v.replace(/\s+/g, ''))
  .refine((v) => CODE_REGEX.test(v), {
    message:
      'Coupon code must be 3–40 characters and use only letters, numbers, dashes or underscores.',
  })

const numericString = (label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? v.trim() : v))
    .refine((v) => v !== '' && Number.isFinite(Number(v)), { message: `${label} must be a number.` })
    .transform((v) => Number(v))

export const validateCouponPublicSchema = z.object({
  code: couponCodeSchema,
  subtotal: numericString('Subtotal'),
  userEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  isWholesale: z.boolean().optional().default(false),
})

export type ValidateCouponPublicInput = z.infer<typeof validateCouponPublicSchema>

const optionalIsoDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === '') return null
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return null
    return d
  })

const baseAdminCouponShape = {
  code: couponCodeSchema,
  percentage: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 100, {
      message: 'Percentage must be a whole number between 1 and 100.',
    }),
  isActive: z.boolean().optional().default(true),
  appliesToCustomers: z.boolean().optional().default(true),
  appliesToWholesale: z.boolean().optional().default(false),
  startsAt: optionalIsoDate,
  endsAt: optionalIsoDate,
  totalUsageLimit: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === '') return null
      const n = Number(v)
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null
    }),
  perCustomerLimit: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === '') return 1
      const n = Number(v)
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 1
    }),
}

export const createCouponSchema = z
  .object(baseAdminCouponShape)
  .refine((v) => v.appliesToCustomers || v.appliesToWholesale, {
    message: 'Choose at least one audience: customers or wholesale.',
    path: ['appliesToCustomers'],
  })
  .refine(
    (v) =>
      !v.startsAt || !v.endsAt || v.endsAt.getTime() > v.startsAt.getTime(),
    { message: 'End date must be after the start date.', path: ['endsAt'] },
  )

export const updateCouponSchema = z
  .object({
    code: couponCodeSchema.optional(),
    percentage: baseAdminCouponShape.percentage.optional(),
    isActive: z.boolean().optional(),
    appliesToCustomers: z.boolean().optional(),
    appliesToWholesale: z.boolean().optional(),
    startsAt: optionalIsoDate,
    endsAt: optionalIsoDate,
    totalUsageLimit: baseAdminCouponShape.totalUsageLimit,
    perCustomerLimit: baseAdminCouponShape.perCustomerLimit,
  })
  .refine(
    (v) =>
      v.appliesToCustomers === undefined && v.appliesToWholesale === undefined
        ? true
        : Boolean(v.appliesToCustomers) || Boolean(v.appliesToWholesale),
    { message: 'Choose at least one audience: customers or wholesale.', path: ['appliesToCustomers'] },
  )
