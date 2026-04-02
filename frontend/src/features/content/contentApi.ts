import { apiFetch } from '../../lib/api'

export type PublicTestimonial = {
  id: string
  customerName: string
  text: string
  isVisible: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export type MarketingContent = {
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
  updatedAt: string
}

export type ThemeSettings = {
  primaryBrandColor: string
  secondaryBrandColor: string
  buttonStyleEmphasis: 'solid' | 'soft'
  homepageHeroEmphasis: boolean
  trustBadgesVisible: boolean
  trustBadgeHeading: string
  headerLogoPath: string
  footerLogoPath: string
  trustBadgeIconPath: string
  updatedAt: string
}

export type BusinessSettings = {
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
  updatedAt: string
}

export async function getPublicTestimonials() {
  return apiFetch<{ testimonials: PublicTestimonial[] }>('/api/testimonials').then((r) => r.testimonials)
}

export async function getPublicMarketingContent() {
  return apiFetch<{ marketing: MarketingContent }>('/api/content/marketing').then((r) => r.marketing)
}

export async function getPublicThemeSettings() {
  return apiFetch<{ theme: ThemeSettings }>('/api/content/theme').then((r) => r.theme)
}

export async function getPublicBusinessSettings() {
  return apiFetch<{ business: BusinessSettings }>('/api/content/business').then((r) => r.business)
}
