import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { slugify } from '../utils/slug'

/**
 * Idempotent demo catalog for By Celeste (skincare).
 * Safe to re-run: upserts by unique slug.
 *
 * Run: npm run seed:catalog
 * (Requires migrations applied and DATABASE_URL set.)
 */
export async function runSeedCatalog() {
  const REQUIRED_PRODUCT_SLUGS = [
    'kakadu-plum-radiance-facial-oil',
    'desert-lime-cream-cleanser',
    'wild-rosella-hydrating-face-mist',
    'banksia-quandong-nourishing-day-cream',
    'tasmanian-sea-kelp-night-renewal-balm',
    'lilly-pilly-brightening-enzyme-mask',
    'macadamia-lemon-myrtle-body-wash',
    'wattleseed-vanilla-exfoliating-body-polish',
    'eucalyptus-kunzea-muscle-recovery-body-oil',
    'alpine-lavender-calming-body-lotion',
    'grapefruit-finger-lime-hand-body-wash',
    'lemon-myrtle-manuka-hand-cream',
    'macadamia-wattleseed-repair-balm',
    'desert-sand-pumice-foot-scrub',
    'blue-gum-epsom-mineral-bath-soak',
    'wildflower-sleep-pillow-linen-mist',
    'native-honey-clay-purifying-face-body-mask',
    'native-essentials-discovery-trio',
    'australian-body-ritual-gift-box',
    'market-day-hand-body-duo',
  ] as const

  const IMAGE_URL_BY_SLUG: Record<string, string> = {
    'kakadu-plum-radiance-facial-oil': '/images/products/kakadu-plum-radiance-facial-oil.jpg',
    'desert-lime-cream-cleanser': '/images/products/desert-lime-cream-cleanser.jpg',
    'wild-rosella-hydrating-face-mist': '/images/products/wild-rosella-hydrating-face-mist.jpg',
    'banksia-quandong-nourishing-day-cream': '/images/products/banksia-quandong-nourishing-day-cream.jpg',
    'tasmanian-sea-kelp-night-renewal-balm': '/images/products/tasmanian-sea-kelp-night-renewal-balm.jpg',
    'lilly-pilly-brightening-enzyme-mask': '/images/products/lilly-pilly-brightening-enzyme-mask.png',
    'macadamia-lemon-myrtle-body-wash': '/images/products/macadamia-lemon-myrtle-body-wash.jpg',
    'wattleseed-vanilla-exfoliating-body-polish': '/images/products/wattleseed-vanilla-exfoliating-body-polish.jpg',
    'eucalyptus-kunzea-muscle-recovery-body-oil': '/images/products/eucalyptus-kunzea-muscle-recovery-body-oil.jpg',
    'alpine-lavender-calming-body-lotion': '/images/products/alpine-lavender-calming-body-lotion.jpg',
    'grapefruit-finger-lime-hand-body-wash': '/images/products/grapefruit-finger-lime-hand-body-wash.png',
    'lemon-myrtle-manuka-hand-cream': '/images/products/lemon-myrtle-manuka-hand-cream.png',
    'macadamia-wattleseed-repair-balm': '/images/products/macadamia-wattleseed-repair-balm.png',
    'desert-sand-pumice-foot-scrub': '/images/products/desert-sand-pumice-foot-scrub.png',
    'blue-gum-epsom-mineral-bath-soak': '/images/products/blue-gum-epsom-mineral-bath-soak.png',
    'wildflower-sleep-pillow-linen-mist': '/images/products/wildflower-sleep-pillow-linen-mist.png',
    'native-honey-clay-purifying-face-body-mask': '/images/products/native-honey-clay-purifying-face-body-mask.jpg',
    'native-essentials-discovery-trio': '/images/products/native-essentials-discovery-trio.png',
    'australian-body-ritual-gift-box': '/images/products/australian-body-ritual-gift-box.png',
    'market-day-hand-body-duo': '/images/products/market-day-hand-body-duo.png',
  }

  const CATEGORY_BY_SLUG: Record<string, 'Face Care' | 'Body Care' | 'Hands & Feet' | 'Bath & Ritual' | 'Gift Sets & Discovery Kits'> =
    {
      'kakadu-plum-radiance-facial-oil': 'Face Care',
      'desert-lime-cream-cleanser': 'Face Care',
      'wild-rosella-hydrating-face-mist': 'Face Care',
      'banksia-quandong-nourishing-day-cream': 'Face Care',
      'tasmanian-sea-kelp-night-renewal-balm': 'Face Care',
      'lilly-pilly-brightening-enzyme-mask': 'Face Care',
      'native-honey-clay-purifying-face-body-mask': 'Face Care',

      'macadamia-lemon-myrtle-body-wash': 'Body Care',
      'wattleseed-vanilla-exfoliating-body-polish': 'Body Care',
      'eucalyptus-kunzea-muscle-recovery-body-oil': 'Body Care',
      'alpine-lavender-calming-body-lotion': 'Body Care',

      'grapefruit-finger-lime-hand-body-wash': 'Hands & Feet',
      'lemon-myrtle-manuka-hand-cream': 'Hands & Feet',
      'macadamia-wattleseed-repair-balm': 'Hands & Feet',
      'desert-sand-pumice-foot-scrub': 'Hands & Feet',

      'blue-gum-epsom-mineral-bath-soak': 'Bath & Ritual',
      'wildflower-sleep-pillow-linen-mist': 'Bath & Ritual',

      'native-essentials-discovery-trio': 'Gift Sets & Discovery Kits',
      'australian-body-ritual-gift-box': 'Gift Sets & Discovery Kits',
      'market-day-hand-body-duo': 'Gift Sets & Discovery Kits',
    }

  const FEATURED_SLUGS = new Set<string>([
    'kakadu-plum-radiance-facial-oil',
    'banksia-quandong-nourishing-day-cream',
    'tasmanian-sea-kelp-night-renewal-balm',
    'lilly-pilly-brightening-enzyme-mask',
    'macadamia-lemon-myrtle-body-wash',
    'native-essentials-discovery-trio',
    'australian-body-ritual-gift-box',
  ])

  const STOCK_QUANTITY = 50

  function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function extractBetween(text: string, startMarker: string, endMarker: string): string {
    const re = new RegExp(
      `${escapeRegExp(startMarker)}\\s*([\\s\\S]*?)${escapeRegExp(endMarker)}`,
      'm',
    )
    const match = text.match(re)
    if (!match) {
      throw new Error(`Missing markers: ${startMarker} -> ${endMarker}`)
    }
    return match[1].trim()
  }

  function extractBullets(text: string): string[] {
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^-\s+/.test(l) || /^-\s*$/.test(l))
      .map((l) => l.replace(/^-+\s?/, '').trim())
      .filter(Boolean)
  }

  function extractKeyBenefits(text: string): string {
    const startRe = /\*\*Key benefits:\*\*/i
    const startIndex = text.search(startRe)
    if (startIndex < 0) throw new Error('Missing **Key benefits:** marker.')

    const startMatch = text.slice(startIndex).match(startRe)
    const startEnd = startMatch ? startIndex + startMatch[0].length : startIndex

    // Prefer Key ingredients when present; otherwise stop at the first How to use block.
    let endIndex = text.search(/\*\*Key ingredients:\*\*/i)
    if (endIndex < 0) endIndex = text.search(/\*\*How to use[^*]*\*\*/i)
    if (endIndex < 0) throw new Error('Missing end marker for **Key benefits:** block.')

    return text.slice(startEnd, endIndex).trim()
  }

  function extractKeyIngredientsOptional(text: string): string | null {
    const startRe = /\*\*Key ingredients:\*\*/i
    const startIndex = text.search(startRe)
    if (startIndex < 0) return null

    const startMatch = text.slice(startIndex).match(startRe)
    const startEnd = startMatch ? startIndex + startMatch[0].length : startIndex

    const endIndex = text.search(/\*\*How to use[^*]*\*\*/i)
    const fallbackEndIndex = text.search(/\*\*Price:\*\*/i)

    const realEndIndex = endIndex >= 0 ? endIndex : fallbackEndIndex
    if (realEndIndex < 0) return null

    return text.slice(startEnd, realEndIndex).trim()
  }

  function extractHowToUse(text: string): string {
    const startRe = /\*\*How to use[^*]*\*\*/i
    const startIndex = text.search(startRe)
    if (startIndex < 0) throw new Error('Missing **How to use:** marker.')

    const startMatch = text.slice(startIndex).match(startRe)
    const startEnd = startMatch ? startIndex + startMatch[0].length : startIndex

    const priceIndex = text.search(/\*\*Price:\*\*/i)
    if (priceIndex < 0) throw new Error('Missing **Price:** marker.')

    return text.slice(startEnd, priceIndex).trim()
  }

  function normalizeProductNameForSlug(name: string): string {
    // Docs heading sometimes ends with a parenthetical (e.g. "(Hands, Elbows & Heels)").
    // The requested site slug removes that suffix.
    return name.replace(/\s*\([^)]*\)\s*$/, '').trim()
  }

  function productShortDescriptionFromLong(description: string): string {
    const sentences = description
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return sentences.slice(0, 2).join(' ') || description.slice(0, 180)
  }

  function categoryNameToSlug(categoryName: string): string {
    return slugify(categoryName)
  }

  const topLevelCategories = [
    { name: 'Face Care', slug: categoryNameToSlug('Face Care'), description: 'Barrier-friendly essentials for daily routines.' },
    { name: 'Body Care', slug: categoryNameToSlug('Body Care'), description: 'Comforting hydration for whole-body rituals.' },
    { name: 'Hands & Feet', slug: categoryNameToSlug('Hands & Feet'), description: 'Targeted care for hardworking hands and feet.' },
    { name: 'Bath & Ritual', slug: categoryNameToSlug('Bath & Ritual'), description: 'Slow, soothing moments to support skin and senses.' },
    { name: 'Gift Sets & Discovery Kits', slug: categoryNameToSlug('Gift Sets & Discovery Kits'), description: 'Curated sets for gifting, trying, and loving.' },
  ] as const

  const topLevelCategorySlugs = topLevelCategories.map((c) => c.slug)

  const docsPath = path.join(__dirname, '../../../docs/04-products.md')
  /** Optional: real client catalog from Word → Markdown (same section format as docs/04-products.md). */
  const clientCatalogPath = path.join(__dirname, '../../data/client-products.md')
  const catalogMarkdownPath = fs.existsSync(clientCatalogPath) ? clientCatalogPath : docsPath
  const docs = fs.readFileSync(catalogMarkdownPath, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`[seedCatalog] Catalog source: ${catalogMarkdownPath}`)

  // Categories
  const categoryRows = await Promise.all(
    topLevelCategories.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        create: { name: c.name, slug: c.slug, description: c.description, isActive: true },
        update: { name: c.name, description: c.description, isActive: true },
      }),
    ),
  )
  const categoryIdBySlug: Record<string, string> = {}
  for (const c of categoryRows) categoryIdBySlug[c.slug] = c.id

  // Deactivate any old/non-top-level categories
  await prisma.category.updateMany({
    where: { slug: { notIn: topLevelCategorySlugs } },
    data: { isActive: false },
  })

  // Parse docs product sections and build seeds
  // Docs use `### By Celeste – <Product Name>` for most products, but at least one entry
  // appears as `### By Celeste <Product Name>` (without the dash). Support both.
  const headingRe = /^### By Celeste\s+–?\s*(.+)$/gm
  const headings: Array<{ name: string; startIndex: number }> = []
  for (const match of docs.matchAll(headingRe)) {
    const idx = match.index
    if (idx == null) continue
    headings.push({ name: match[1], startIndex: idx })
  }

  headings.sort((a, b) => a.startIndex - b.startIndex)

  const requiredSet = new Set<string>(REQUIRED_PRODUCT_SLUGS as unknown as string[])

  type IngredientSeed = { name: string; slug: string; description: string }
  const ingredientBySlug = new Map<string, IngredientSeed>()
  const ingredientSlugsByProductSlug = new Map<string, string[]>()
  const displayNameBySlug = new Map<string, string>()

  type ProductSeed = {
    slug: string
    name: string
    shortDescription: string
    description: string
    howToUse: string
    price: string
    imageUrl: string
    benefits: string[]
    categoryName: string
    ingredientSlugs: string[]
    isFeatured: boolean
  }

  const productSeeds: ProductSeed[] = []

  function parseIngredientLine(line: string): IngredientSeed {
    const cleaned = line.replace(/^-+\s*/, '').trim()
    const m = cleaned.match(/^(.*?)\s[–-]\s(.*)$/)
    if (!m) {
      return { name: cleaned, slug: slugify(cleaned), description: cleaned }
    }
    const name = m[1].trim()
    const description = m[2].trim()
    return { name, slug: slugify(name), description }
  }

  for (let i = 0; i < headings.length; i++) {
    const { name: headingName, startIndex } = headings[i]
    const sectionStart = startIndex
    const sectionEnd = i + 1 < headings.length ? headings[i + 1].startIndex : docs.length
    const section = docs.slice(sectionStart, sectionEnd)

    const normalizedForSlug = normalizeProductNameForSlug(headingName)
    const slugCandidate = slugify(normalizedForSlug)
    if (!requiredSet.has(slugCandidate)) continue

    displayNameBySlug.set(slugCandidate, normalizedForSlug)

    const rawDescription = extractBetween(section, '**Description:**', '**Key benefits:**')
    const rawBenefits = extractKeyBenefits(section)
    const benefits = extractBullets(rawBenefits)
    const rawHowToUse = extractHowToUse(section)
    const howToUseBullets = extractBullets(rawHowToUse)

    const priceMatch = section.match(/\*\*Price:\*\*\s*AUD\s*\$([0-9]+(?:\.[0-9]+)?)/i)
    if (!priceMatch) {
      throw new Error(`Could not parse price for slug: ${slugCandidate}`)
    }
    const priceNum = Number(priceMatch[1])
    const price = priceNum.toFixed(2)

    const categoryName = CATEGORY_BY_SLUG[slugCandidate]
    if (!categoryName) {
      throw new Error(`Missing category mapping for slug: ${slugCandidate}`)
    }

    const imageUrl = IMAGE_URL_BY_SLUG[slugCandidate]
    if (!imageUrl) {
      throw new Error(`Missing image mapping for slug: ${slugCandidate}`)
    }

    const description = rawDescription.replace(/\s+/g, ' ').trim()
    const shortDescription = productShortDescriptionFromLong(description)
    const howToUse = howToUseBullets.join('\n').trim()

    const ingredientSlugs: string[] = []
    if (categoryName === 'Gift Sets & Discovery Kits') {
      // Gift sets often omit structured ingredient bullets in the docs.
      // Infer ingredients by union of hero-product ingredients mentioned in the description.
      const heroSlugs = Array.from(displayNameBySlug.entries())
        .filter(([heroSlug, heroName]) => heroSlug !== slugCandidate && description.includes(heroName))
        .map(([heroSlug]) => heroSlug)

      const inferred = heroSlugs.flatMap((heroSlug) => ingredientSlugsByProductSlug.get(heroSlug) ?? [])
      ingredientSlugs.push(...Array.from(new Set(inferred)))

      // If inference failed (unexpected docs format), fall back to any available Key ingredients block.
      if (ingredientSlugs.length === 0) {
        const rawIngredientsMaybe = extractKeyIngredientsOptional(section)
        const ingredientLines = rawIngredientsMaybe ? extractBullets(rawIngredientsMaybe) : []
        const ingredientSeeds = ingredientLines.map(parseIngredientLine)
        for (const ing of ingredientSeeds) {
          ingredientSlugs.push(ing.slug)
          if (!ingredientBySlug.has(ing.slug)) ingredientBySlug.set(ing.slug, ing)
        }
      }
    } else {
      const rawIngredientsMaybe = extractKeyIngredientsOptional(section)
      if (!rawIngredientsMaybe) {
        throw new Error(`Missing **Key ingredients:** for non-gift product slug: ${slugCandidate}`)
      }

      const ingredientLines = extractBullets(rawIngredientsMaybe)
      const ingredientSeeds = ingredientLines.map(parseIngredientLine)
      for (const ing of ingredientSeeds) {
        ingredientSlugs.push(ing.slug)
        if (!ingredientBySlug.has(ing.slug)) ingredientBySlug.set(ing.slug, ing)
      }
    }

    productSeeds.push({
      slug: slugCandidate,
      name: normalizedForSlug,
      shortDescription,
      description,
      howToUse,
      price,
      imageUrl,
      benefits,
      categoryName,
      ingredientSlugs: Array.from(new Set(ingredientSlugs)),
      isFeatured: FEATURED_SLUGS.has(slugCandidate),
    })

    ingredientSlugsByProductSlug.set(slugCandidate, Array.from(new Set(ingredientSlugs)))
  }

  const missing = REQUIRED_PRODUCT_SLUGS.filter((s) => !productSeeds.some((p) => p.slug === s))
  if (missing.length > 0) {
    throw new Error(`Seed parsing did not find all required products. Missing: ${missing.join(', ')}`)
  }

  // Upsert ingredients
  const ingredientsArray = Array.from(ingredientBySlug.values())
  const allIngredientSlugs = ingredientsArray.map((i) => i.slug)
  await Promise.all(
    ingredientsArray.map((ing) =>
      prisma.ingredient.upsert({
        where: { slug: ing.slug },
        create: {
          name: ing.name,
          slug: ing.slug,
          description: ing.description,
          benefits: null,
        },
        update: {
          name: ing.name,
          description: ing.description,
          benefits: null,
        },
      }),
    ),
  )

  const ingredientRows = await prisma.ingredient.findMany({
    where: { slug: { in: allIngredientSlugs } },
    select: { id: true, slug: true },
  })
  const ingredientIdBySlug: Record<string, string> = {}
  for (const ing of ingredientRows) ingredientIdBySlug[ing.slug] = ing.id

  // Upsert products
  for (const p of productSeeds) {
    const categorySlug = categoryNameToSlug(p.categoryName)
    const categoryId = categoryIdBySlug[categorySlug]
    if (!categoryId) throw new Error(`Missing category id for ${categorySlug}`)

    const ingredientConnect = p.ingredientSlugs.map((slug) => ({ id: ingredientIdBySlug[slug] }))
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        howToUse: p.howToUse,
        benefits: p.benefits,
        price: new Prisma.Decimal(p.price),
        wholesalePrice: null,
        compareAtPrice: null,
        imageUrl: p.imageUrl,
        isActive: true,
        isFeatured: p.isFeatured,
        stockQuantity: STOCK_QUANTITY,
        categories: { connect: [{ id: categoryId }] },
        ingredients: { connect: ingredientConnect },
      },
      update: {
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        howToUse: p.howToUse,
        benefits: p.benefits,
        price: new Prisma.Decimal(p.price),
        wholesalePrice: null,
        compareAtPrice: null,
        imageUrl: p.imageUrl,
        isActive: true,
        isFeatured: p.isFeatured,
        stockQuantity: STOCK_QUANTITY,
        categories: { set: [{ id: categoryId }] },
        ingredients: { set: ingredientConnect },
      },
    })
  }

  // Deactivate any other products not in the required set
  await prisma.product.updateMany({
    where: { slug: { notIn: REQUIRED_PRODUCT_SLUGS as unknown as string[] } },
    data: { isActive: false },
  })

  console.log(
    `[seedCatalog] Seeded ${productSeeds.length} products, ${ingredientsArray.length} ingredients, and ${topLevelCategories.length} categories.`,
  )
}

function isSeedCatalogCli() {
  const entry = (process.argv[1] ?? '').replace(/\\/g, '/')
  return /(^|\/)seedCatalog\.(ts|js|mjs|cjs)$/.test(entry)
}

if (isSeedCatalogCli()) {
  runSeedCatalog()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (err) => {
      console.error(err)
      await prisma.$disconnect()
      process.exit(1)
    })
}
