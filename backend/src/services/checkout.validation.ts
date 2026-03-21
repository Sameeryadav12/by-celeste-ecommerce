import { z } from 'zod/v3'

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

const nameRegex = /^[A-Za-z ]+$/

const cartItemSchema = z.object({
  productId: z.string().trim().min(1, 'Each cart item needs a product id.'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number.' })
    .int('Quantity must be a whole number.')
    .min(1, 'Quantity must be at least 1.'),
})

export const createCheckoutSessionSchema = z
  .object({
    cartItems: z
      .array(cartItemSchema)
      .min(1, 'Your cart must contain at least one item.')
      .max(100, 'Too many line items in this checkout.'),

    firstName: z
      .string({ required_error: 'First name is required.' })
      .trim()
      .min(2, 'First name must be between 2 and 50 characters.')
      .max(50, 'First name must be between 2 and 50 characters.')
      .regex(nameRegex, 'First name can only contain letters and spaces.'),

    lastName: z
      .string({ required_error: 'Last name is required.' })
      .trim()
      .min(2, 'Last name must be between 2 and 50 characters.')
      .max(50, 'Last name must be between 2 and 50 characters.')
      .regex(nameRegex, 'Last name can only contain letters and spaces.'),

    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address.'),

    phone: z
      .string({ required_error: 'Phone is required.' })
      .trim()
      .transform((v) => v.replace(/\s+/g, ''))
      .refine((v) => /^(\+?61|0)[2-478]\d{8}$/.test(v), {
        message: 'Please enter a valid Australian phone number.',
      }),

    addressLine1: z
      .string({ required_error: 'Address line 1 is required.' })
      .trim()
      .min(5, 'Address line 1 looks too short.')
      .max(200, 'Address line 1 is too long.'),

    addressLine2: z
      .string()
      .trim()
      .max(200, 'Address line 2 is too long.')
      .optional()
      .transform((v) => (v === '' ? undefined : v)),

    suburb: z
      .string({ required_error: 'Suburb is required.' })
      .trim()
      .min(2, 'Suburb must be between 2 and 100 characters.')
      .max(100, 'Suburb must be between 2 and 100 characters.'),

    state: z.enum(AU_STATES, {
      errorMap: () => ({ message: 'Please select a valid Australian state or territory.' }),
    }),

    postcode: z
      .string({ required_error: 'Postcode is required.' })
      .trim()
      .regex(/^\d{4}$/, 'Postcode must be exactly 4 digits.'),

    country: z
      .string({ required_error: 'Country is required.' })
      .trim()
      .min(1, 'Country is required.')
      .max(100, 'Country value is too long.')
      .transform((v) => (v.toLowerCase() === 'au' ? 'Australia' : v)),

    notes: z
      .string()
      .trim()
      .max(1000, 'Notes must be 1000 characters or fewer.')
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
  })
  .strict()

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>
