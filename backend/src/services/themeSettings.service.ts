import { readContentDb, writeContentDb } from './contentStore'

export async function getThemeSettings() {
  const db = await readContentDb()
  return db.theme
}

export async function updateThemeSettings(
  input: Partial<{
    primaryBrandColor: string
    secondaryBrandColor: string
    buttonStyleEmphasis: 'solid' | 'soft'
    homepageHeroEmphasis: boolean
    trustBadgesVisible: boolean
    trustBadgeHeading: string
    headerLogoPath: string
    footerLogoPath: string
    trustBadgeIconPath: string
  }>,
) {
  const db = await readContentDb()
  db.theme = {
    ...db.theme,
    ...Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ),
    updatedAt: new Date().toISOString(),
  }
  await writeContentDb(db)
  return db.theme
}
