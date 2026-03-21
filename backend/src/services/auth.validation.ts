// Zod v4 default API differs from v3; v3 import keeps `required_error` and familiar patterns
import { z } from 'zod/v3'

const nameRegex = /^[A-Za-z ]+$/

export const signupSchema = z
  .object({
    firstName: z
      .string({ required_error: 'First name is required.' })
      .trim()
      .min(2, 'First name must be at least 2 characters.')
      .max(50, 'First name must be at most 50 characters.')
      .refine((v) => nameRegex.test(v), 'First name can only contain letters and spaces.'),
    lastName: z
      .string({ required_error: 'Last name is required.' })
      .trim()
      .min(2, 'Last name must be at least 2 characters.')
      .max(50, 'Last name must be at most 50 characters.')
      .refine((v) => nameRegex.test(v), 'Last name can only contain letters and spaces.'),
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .toLowerCase()
      .email('Email must be a valid email address.'),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(8, 'Password must be at least 8 characters.')
      .refine((v) => /[a-z]/.test(v), 'Password must contain at least 1 lowercase letter.')
      .refine((v) => /[A-Z]/.test(v), 'Password must contain at least 1 uppercase letter.')
      .refine((v) => /\d/.test(v), 'Password must contain at least 1 digit.')
      .refine(
        (v) => /[^A-Za-z0-9]/.test(v),
        'Password must contain at least 1 special character.',
      ),
    role: z.enum(['CUSTOMER', 'WHOLESALE', 'ADMIN']).optional(),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .toLowerCase()
      .email('Email must be a valid email address.'),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(1, 'Password cannot be empty.'),
  })
  .strict()

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>

