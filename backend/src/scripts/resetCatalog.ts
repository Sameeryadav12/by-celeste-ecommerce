import 'dotenv/config'
import { prisma } from '../config/prisma'

/**
 * Wipes catalog data only (products, categories, ingredients).
 * Orders are kept — line items use snapshots, not FKs to Product.
 *
 * Run: npm run catalog:reset
 */
async function main() {
  const deletedProducts = await prisma.product.deleteMany()
  const deletedCategories = await prisma.category.deleteMany()
  const deletedIngredients = await prisma.ingredient.deleteMany()

  console.log('[resetCatalog] Removed:')
  console.log(`  products: ${deletedProducts.count}`)
  console.log(`  categories: ${deletedCategories.count}`)
  console.log(`  ingredients: ${deletedIngredients.count}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
