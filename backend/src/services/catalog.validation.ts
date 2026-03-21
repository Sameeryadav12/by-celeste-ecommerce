// Zod v4 package includes v3 API for familiar patterns (same as auth.validation)
import { z } from 'zod/v3'

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug cannot be empty.')
  .max(120, 'Slug is too long.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must use lowercase letters, numbers, and single hyphens only.',
  )

const optionalSlugField = slugField.optional()

const imageUrlField = z
  .string()
  .trim()
  .min(1, 'Image URL is required.')
  .refine(
    (v) => /^https?:\/\//i.test(v) || v.startsWith('/'),
    'Image must be a valid http(s) URL or a path starting with /.',
  )

export const categoryCreateSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required.' })
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.'),
    slug: optionalSlugField,
    description: z
      .string()
      .trim()
      .max(2000, 'Description is too long.')
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export const categoryUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.')
      .optional(),
    slug: optionalSlugField,
    description: z
      .union([z.string().trim().max(2000, 'Description is too long.'), z.null()])
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  })

export const ingredientCreateSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required.' })
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.'),
    slug: optionalSlugField,
    description: z
      .string({ required_error: 'Description is required.' })
      .trim()
      .min(10, 'Description should be at least 10 characters.')
      .max(5000, 'Description is too long.'),
    benefits: z
      .string()
      .trim()
      .max(2000, 'Benefits text is too long.')
      .optional(),
  })
  .strict()

export const ingredientUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must be at most 100 characters.')
      .optional(),
    slug: optionalSlugField,
    description: z
      .string()
      .trim()
      .min(10, 'Description should be at least 10 characters.')
      .max(5000, 'Description is too long.')
      .optional(),
    benefits: z
      .union([z.string().trim().max(2000, 'Benefits text is too long.'), z.null()])
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  })

const money = z.coerce
  .number({ invalid_type_error: 'Price must be a number.' })
  .positive('Price must be greater than zero.')

const optionalMoney = z.coerce
  .number({ invalid_type_error: 'Compare-at price must be a number.' })
  .positive('Compare-at price must be greater than zero.')
  .optional()

const optionalWholesaleMoney = z.union([
  z.coerce
    .number({ invalid_type_error: 'Wholesale price must be a number.' })
    .positive('Wholesale price must be greater than zero.'),
  z.null(),
])

export const productCreateSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required.' })
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(150, 'Name must be at most 150 characters.'),
    slug: optionalSlugField,
    shortDescription: z
      .string({ required_error: 'Short description is required.' })
      .trim()
      .min(10, 'Short description should be at least 10 characters.')
      .max(500, 'Short description is too long.'),
    description: z
      .string({ required_error: 'Description is required.' })
      .trim()
      .min(20, 'Description should be at least 20 characters.')
      .max(20000, 'Description is too long.'),
    howToUse: z
      .string({ required_error: 'How to use is required.' })
      .trim()
      .min(10, 'How to use should be at least 10 characters.')
      .max(5000, 'How to use is too long.'),
    price: money,
    wholesalePrice: optionalWholesaleMoney.optional(),
    compareAtPrice: optionalMoney,
    imageUrl: imageUrlField,
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    stockQuantity: z.coerce
      .number({ invalid_type_error: 'Stock quantity must be a number.' })
      .int('Stock quantity must be a whole number.')
      .min(0, 'Stock quantity cannot be negative.'),
    categoryIds: z.array(z.string().min(1)).optional(),
    ingredientIds: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.compareAtPrice != null && data.compareAtPrice < data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Compare-at price must be greater than or equal to the regular price.',
        path: ['compareAtPrice'],
      })
    }
    if (data.wholesalePrice != null && data.wholesalePrice > data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wholesale price must be less than or equal to the retail price.',
        path: ['wholesalePrice'],
      })
    }
  })

export const productUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(150, 'Name must be at most 150 characters.')
      .optional(),
    slug: optionalSlugField,
    shortDescription: z
      .string()
      .trim()
      .min(10, 'Short description should be at least 10 characters.')
      .max(500, 'Short description is too long.')
      .optional(),
    description: z
      .string()
      .trim()
      .min(20, 'Description should be at least 20 characters.')
      .max(20000, 'Description is too long.')
      .optional(),
    howToUse: z
      .string()
      .trim()
      .min(10, 'How to use should be at least 10 characters.')
      .max(5000, 'How to use is too long.')
      .optional(),
    price: z.coerce
      .number()
      .positive('Price must be greater than zero.')
      .optional(),
    wholesalePrice: optionalWholesaleMoney.optional(),
    compareAtPrice: z
      .union([
        z.coerce.number().positive('Compare-at price must be greater than zero.'),
        z.null(),
      ])
      .optional(),
    imageUrl: z
      .string()
      .trim()
      .min(1)
      .refine(
        (v) => /^https?:\/\//i.test(v) || v.startsWith('/'),
        'Image must be a valid http(s) URL or a path starting with /.',
      )
      .optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    stockQuantity: z.coerce
      .number()
      .int('Stock quantity must be a whole number.')
      .min(0, 'Stock quantity cannot be negative.')
      .optional(),
    categoryIds: z.array(z.string().min(1)).optional(),
    ingredientIds: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  })
  .superRefine((data, ctx) => {
    if (
      data.wholesalePrice != null &&
      data.price != null &&
      data.wholesalePrice > data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wholesale price must be less than or equal to the retail price.',
        path: ['wholesalePrice'],
      })
    }
  })

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
export type IngredientCreateInput = z.infer<typeof ingredientCreateSchema>
export type IngredientUpdateInput = z.infer<typeof ingredientUpdateSchema>
export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
