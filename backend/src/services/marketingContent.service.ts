import { readContentDb, writeContentDb } from './contentStore'

export async function getMarketingContent() {
  const db = await readContentDb()
  return db.marketing
}

export async function updateMarketingContent(
  input: Partial<{
    homepageHeroHeading: string
    homepageSubtext: string
    homepageTagline: string
    featuredProductsHeading: string
    ingredientsSectionHeading: string
    ingredientsSectionText: string
    testimonialsSectionHeading: string
    testimonialsSectionSubheading: string
    facebookUrl: string
    footerTrustWording: string
  }>,
) {
  const db = await readContentDb()
  db.marketing = {
    ...db.marketing,
    ...Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ),
    updatedAt: new Date().toISOString(),
  }
  await writeContentDb(db)
  return db.marketing
}
