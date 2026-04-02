import { readContentDb, writeContentDb } from './contentStore'

export async function getBusinessSettings() {
  const db = await readContentDb()
  return db.business
}

export async function updateBusinessSettings(
  input: Partial<{
    businessDisplayName: string
    footerLocationWording: string
    footerSupportText: string
    facebookUrl: string
    trustStripWording: string
    shippingMethodLabel: string
    shippingAmountDisplay: string
    shippingCarrierWording: string
    shippingExplanatoryNote: string
    australiaPostCarrierWording: string
  }>,
) {
  const db = await readContentDb()
  db.business = {
    ...db.business,
    ...Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ),
    updatedAt: new Date().toISOString(),
  }
  await writeContentDb(db)
  return db.business
}
