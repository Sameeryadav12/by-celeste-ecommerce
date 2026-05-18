import 'dotenv/config'
import { Prisma } from '@prisma/client'
import { CLIENT_CATALOG_PRODUCTS } from '../../data/client-catalog'
import { prisma } from '../config/prisma'
import { slugify } from '../utils/slug'

/** Product title may include size (e.g. 60g, 175mL); ingredient blurbs should not. */
function catalogNameWithoutWeight(name: string): string {
  return name.replace(/\s*\d+\s*(?:g|ml|mL)\s*$/i, '').trim()
}

/**
 * Upserts categories, ingredients, and products from backend/data/client-catalog.ts
 *
 * Run: npm run seed:client-catalog
 */
export async function runSeedClientCatalog() {
  const categoryIds = new Map<string, string>()

  for (const product of CLIENT_CATALOG_PRODUCTS) {
    if (!product.categorySlug || !product.categoryName) continue
    const category = await prisma.category.upsert({
      where: { slug: product.categorySlug },
      create: {
        name: product.categoryName,
        slug: product.categorySlug,
        description: null,
        isActive: true,
      },
      update: {
        name: product.categoryName,
        isActive: true,
      },
    })
    categoryIds.set(product.categorySlug, category.id)
  }

  for (const product of CLIENT_CATALOG_PRODUCTS) {
    const ingredientConnect: { id: string }[] = []

    const productLabel = catalogNameWithoutWeight(product.name)

    for (const rawName of product.madeWith) {
      const name = rawName.trim()
      const ingSlug = slugify(name)
      const ingDescription = `Used in ${productLabel}.`
      const ing = await prisma.ingredient.upsert({
        where: { slug: ingSlug },
        create: {
          name,
          slug: ingSlug,
          description: ingDescription,
        },
        update: { name, description: ingDescription },
      })
      ingredientConnect.push({ id: ing.id })
    }

    const categoryId = product.categorySlug ? categoryIds.get(product.categorySlug) : undefined
    const categoryConnect = categoryId ? { connect: [{ id: categoryId }] } : undefined
    const categorySet = categoryId ? { set: [{ id: categoryId }] } : { set: [] }

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        howToUse: product.howToUse,
        benefits: product.benefits,
        price: new Prisma.Decimal(product.priceAud.toFixed(2)),
        imageUrl: product.imagePath,
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        stockQuantity: product.stockQuantity ?? 50,
        shopSortOrder: product.shopSortOrder ?? 0,
        ...(categoryConnect ? { categories: categoryConnect } : {}),
        ingredients: { connect: ingredientConnect },
      },
      update: {
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        howToUse: product.howToUse,
        benefits: product.benefits,
        price: new Prisma.Decimal(product.priceAud.toFixed(2)),
        imageUrl: product.imagePath,
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        stockQuantity: product.stockQuantity ?? 50,
        shopSortOrder: product.shopSortOrder ?? 0,
        categories: categorySet,
        ingredients: { set: ingredientConnect },
      },
    })
  }

  console.log(
    `[seedClientCatalog] Upserted ${CLIENT_CATALOG_PRODUCTS.length} product(s) from client-catalog.ts`,
  )
}

async function main() {
  await runSeedClientCatalog()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
