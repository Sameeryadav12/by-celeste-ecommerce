import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { slugify } from '../utils/slug'
import { serializeCategory } from './catalog.serialize'
import type { CategoryCreateInput, CategoryUpdateInput } from './catalog.validation'

async function ensureUniqueCategorySlug(base: string, excludeId?: string) {
  let candidate = base
  let n = 1
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

export async function listCategoriesPublic(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly !== false
  const where: Prisma.CategoryWhereInput = activeOnly ? { isActive: true } : {}

  const rows = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  return rows.map(serializeCategory)
}

export async function createCategory(input: CategoryCreateInput) {
  const slug = input.slug?.length
    ? input.slug
    : await ensureUniqueCategorySlug(slugify(input.name))

  const created = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      isActive: input.isActive ?? true,
    },
  })

  return serializeCategory(created)
}

export async function updateCategory(id: string, input: CategoryUpdateInput) {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category not found.',
    })
  }

  let slug = existing.slug
  if (input.slug != null) {
    slug = await ensureUniqueCategorySlug(input.slug, id)
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name.trim() } : {}),
      slug,
      ...(input.description !== undefined
        ? { description: input.description === null ? null : input.description.trim() }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  })

  return serializeCategory(updated)
}

/** Soft delete: marks category inactive so public APIs hide it; products stay linked. */
export async function deactivateCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category not found.',
    })
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { isActive: false },
  })

  return serializeCategory(updated)
}
