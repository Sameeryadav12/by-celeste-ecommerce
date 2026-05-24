import { prisma } from '../config/prisma'
import { ApiError } from '../utils/apiError'
import { slugify } from '../utils/slug'
import { serializeIngredient } from './catalog.serialize'
import type { IngredientCreateInput, IngredientUpdateInput } from './catalog.validation'

async function ensureUniqueIngredientSlug(base: string, excludeId?: string) {
  let candidate = base
  let n = 1
  while (true) {
    const existing = await prisma.ingredient.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

export async function listIngredientsPublic() {
  const rows = await prisma.ingredient.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return rows.map(serializeIngredient)
}

export async function listIngredientsAdmin() {
  const rows = await prisma.ingredient.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })
  return rows.map(serializeIngredient)
}

export async function createIngredient(input: IngredientCreateInput) {
  const slug = input.slug?.length
    ? input.slug
    : await ensureUniqueIngredientSlug(slugify(input.name))

  const created = await prisma.ingredient.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      benefits: input.benefits?.trim() || null,
    },
  })

  return serializeIngredient(created)
}

export async function updateIngredient(id: string, input: IngredientUpdateInput) {
  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'INGREDIENT_NOT_FOUND',
      message: 'Ingredient not found.',
    })
  }

  let slug = existing.slug
  if (input.slug != null) {
    slug = await ensureUniqueIngredientSlug(input.slug, id)
  }

  const updated = await prisma.ingredient.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name.trim() } : {}),
      slug,
      ...(input.description != null ? { description: input.description.trim() } : {}),
      ...(input.benefits !== undefined
        ? { benefits: input.benefits === null ? null : input.benefits.trim() }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  })

  return serializeIngredient(updated)
}

export async function deactivateIngredient(id: string) {
  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'INGREDIENT_NOT_FOUND',
      message: 'Ingredient not found.',
    })
  }

  const updated = await prisma.ingredient.update({
    where: { id },
    data: { isActive: false },
  })
  return serializeIngredient(updated)
}

/** Permanent removal — unlinks from products via join table; product rows are kept. */
export async function deleteIngredient(id: string) {
  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) {
    throw new ApiError({
      statusCode: 404,
      code: 'INGREDIENT_NOT_FOUND',
      message: 'Ingredient not found.',
    })
  }

  await prisma.ingredient.delete({ where: { id } })
}
