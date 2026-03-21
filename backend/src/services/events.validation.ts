import { z } from 'zod/v3'

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

const optionalSlugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug cannot be empty.')
  .max(120, 'Slug is too long.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must use lowercase letters, numbers, and single hyphens only.',
  )
  .optional()

const optionalAddress = z
  .string()
  .trim()
  .max(200, 'Address line is too long.')
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const optionalImageUrl = z
  .string()
  .trim()
  .max(2048, 'Image URL is too long.')
  .refine((v) => /^https?:\/\//i.test(v) || v.startsWith('/'), {
    message: 'Image URL must be a valid http(s) URL or a path starting with /.',
  })
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const eventBaseSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required.' })
      .trim()
      .min(3, 'Title must be between 3 and 150 characters.')
      .max(150, 'Title must be between 3 and 150 characters.'),
    slug: optionalSlugField,
    shortDescription: z
      .string({ required_error: 'Short description is required.' })
      .trim()
      .min(10, 'Short description is too short.')
      .max(300, 'Short description is too long.'),
    description: z
      .string({ required_error: 'Description is required.' })
      .trim()
      .min(20, 'Description should be at least 20 characters.')
      .max(10000, 'Description is too long.'),
    locationName: z
      .string({ required_error: 'Location name is required.' })
      .trim()
      .min(2, 'Location name must be between 2 and 150 characters.')
      .max(150, 'Location name must be between 2 and 150 characters.'),
    addressLine1: optionalAddress,
    addressLine2: optionalAddress,
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
      .default('Australia'),
    startDateTime: z.string({ required_error: 'Start date/time is required.' }).datetime({
      message: 'Start date/time must be a valid ISO datetime.',
    }),
    endDateTime: z.string({ required_error: 'End date/time is required.' }).datetime({
      message: 'End date/time must be a valid ISO datetime.',
    }),
    imageUrl: optionalImageUrl,
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict()

export const eventCreateSchema = eventBaseSchema.superRefine((data, ctx) => {
  if (new Date(data.endDateTime) <= new Date(data.startDateTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDateTime'],
      message: 'End date/time must be after the start date/time.',
    })
  }
})

export const eventUpdateSchema = eventBaseSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  })
  .superRefine((data, ctx) => {
    if (data.startDateTime && data.endDateTime) {
      if (new Date(data.endDateTime) <= new Date(data.startDateTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDateTime'],
          message: 'End date/time must be after the start date/time.',
        })
      }
    }
  })

export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
