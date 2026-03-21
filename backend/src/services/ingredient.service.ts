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
    orderBy: { name: 'asc' },
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
    },
  })

  return serializeIngredient(updated)
}

/** Soft delete for catalog hygiene: hide from default ingredient list by flag if we add isActive later.
 *  For now ingredients have no isActive — we use hard delete only if no products link, else noop error.
 *  Spec asked soft optional — ingredients lack isActive in schema. I'll add isActive to Ingredient? 
 *  User schema only has: id, name, slug, description, benefits, createdAt, updatedAt — no isActive for ingredient.
 *  So DELETE ingredient: hard delete will CASCADE remove join rows. If product links exist, CASCADE removes links only from join - actually ON DELETE CASCADE on join table removes the link when ingredient deleted, not the product. So hard delete ingredient is OK - products remain, just unlinked.
 *  I'll implement hard delete for ingredient.
 */
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
