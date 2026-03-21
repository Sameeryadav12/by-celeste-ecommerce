import type { CatalogIngredient, CatalogProduct } from './catalogTypes'

/**
 * Up to two short labels for native / hero Australian botanicals (for subtle product badges).
 * Matches ingredient names from the catalog against known natives.
 */
const NATIVE_PATTERNS: Array<{ test: RegExp; label: string }> = [
  { test: /kakadu/i, label: 'Kakadu Plum' },
  { test: /desert lime/i, label: 'Desert Lime' },
  { test: /quandong/i, label: 'Quandong' },
  { test: /banksia/i, label: 'Banksia' },
  { test: /lemon myrtle/i, label: 'Lemon Myrtle' },
  { test: /wattleseed/i, label: 'Wattleseed' },
  { test: /rosella/i, label: 'Wild Rosella' },
  { test: /finger lime/i, label: 'Finger Lime' },
  { test: /lilly pilly/i, label: 'Lilly Pilly' },
  { test: /davidson plum/i, label: 'Davidson Plum' },
  { test: /macadamia/i, label: 'Macadamia' },
  { test: /kunzea/i, label: 'Kunzea' },
  { test: /tasmanian.*kelp|sea kelp/i, label: 'Tasmanian Kelp' },
]

export function nativeHighlightLabels(ingredients: CatalogIngredient[], max = 2): string[] {
  const out: string[] = []
  for (const ing of ingredients) {
    const name = ing.name
    for (const { test, label } of NATIVE_PATTERNS) {
      if (test.test(name) && !out.includes(label)) {
        out.push(label)
        if (out.length >= max) return out
      }
    }
  }
  return out
}

const SLUG_NAME_PATTERNS: Array<{ test: RegExp; label: string }> = [
  { test: /kakadu/i, label: 'Kakadu Plum' },
  { test: /desert-lime|desert lime/i, label: 'Desert Lime' },
  { test: /quandong/i, label: 'Quandong' },
  { test: /banksia/i, label: 'Banksia' },
  { test: /lemon-myrtle|lemon myrtle/i, label: 'Lemon Myrtle' },
  { test: /wattleseed/i, label: 'Wattleseed' },
  { test: /rosella/i, label: 'Wild Rosella' },
  { test: /finger-lime|finger lime/i, label: 'Finger Lime' },
  { test: /lilly-pilly|lilly pilly/i, label: 'Lilly Pilly' },
  { test: /macadamia/i, label: 'Macadamia' },
  { test: /kunzea/i, label: 'Kunzea' },
  { test: /sea-kelp|kelp/i, label: 'Tasmanian Kelp' },
  { test: /honey|clay|native-honey/i, label: 'Native botanicals' },
]

function badgesFromSlugAndName(slug: string, name: string, max: number): string[] {
  const hay = `${slug} ${name}`
  const out: string[] = []
  for (const { test, label } of SLUG_NAME_PATTERNS) {
    if (test.test(hay) && !out.includes(label)) {
      out.push(label)
      if (out.length >= max) return out
    }
  }
  return out
}

export function productNativeBadges(product: CatalogProduct, max = 2): string[] {
  const fromIngredients = nativeHighlightLabels(product.ingredients, max)
  if (fromIngredients.length > 0) return fromIngredients
  return badgesFromSlugAndName(product.slug, product.name, max)
}
