// Zod v3 — match auth.validation
import { z } from 'zod/v3'
import { signupSchema } from './auth.validation'

const nameRegex = /^[A-Za-z ]+$/

export const accountProfilePatchSchema = z
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
    contactEmail: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
      z.string().email('Contact email must be valid.').max(120).optional(),
    ),
    businessName: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
      z.string().min(2, 'Business name must be at least 2 characters.').max(200).optional(),
    ),
    abn: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
      z.string().max(20).optional(),
    ),
  })
  .strip()

export const accountPasswordPatchSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: signupSchema.shape.password,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .strip()
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'New password and confirmation must match.',
    path: ['confirmPassword'],
  })
