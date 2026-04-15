import { promises as fs } from 'fs'
import path from 'path'

export type TestimonialRecord = {
  id: string
  customerName: string
  text: string
  isVisible: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export type MarketingContentRecord = {
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

export type ThemeSettingsRecord = {
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

export type BusinessSettingsRecord = {
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

type ContentDb = {
  testimonials: TestimonialRecord[]
  marketing: MarketingContentRecord
  theme: ThemeSettingsRecord
  business: BusinessSettingsRecord
}

const CONTENT_DIR = path.resolve(process.cwd(), 'data', 'content')
const CONTENT_FILE = path.join(CONTENT_DIR, 'content.json')

const DEFAULT_TESTIMONIALS: TestimonialRecord[] = [
  {
    id: 't-1',
    customerName: 'Linda H',
    text: 'Love, love, love this range especially the Moroccan spice range smells so good and leaves your skin feeling amazing!',
    isVisible: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    customerName: 'Vicki M',
    text: 'Massage oil is amazing. I use it every day for my skin as I am very dry, love the smell.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    customerName: 'Carlie L',
    text: 'Beautiful products. Aiming to get the whole range.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    customerName: 'Maria C',
    text: 'Amazing, use it every day and get complimented daily. All-time favorite Moroccan spice body lotion.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-5',
    customerName: 'Michelle W',
    text: 'After grouting tiles my hands were extremely rough. I tried By Celeste foot scrub on my hands — OMG what a difference! Followed with hand cream and my hands feel fantastic.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-6',
    customerName: 'Tracee A',
    text: "Really beautiful products - will definitely be a return user - nothing I don't love!",
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-7',
    customerName: 'Daisy W',
    text: 'Very impressed and has personalized touch.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-8',
    customerName: 'Karli C',
    text: 'Love the handmade organic soaps and lotions. They leave your skin feeling beautiful and knowing it is all organic gives me peace of mind.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-9',
    customerName: 'Naomi K',
    text: 'All natural and fantastic the way all the products make your skin feel.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-10',
    customerName: 'Sherrie L',
    text: 'The products are fantastic, so gentle on the skin and smell amazing! The clay is the best face mask I have ever used.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-11',
    customerName: 'Vicki W',
    text: 'The oils & creams are amazing, you can smell it all day.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-12',
    customerName: 'Michelle W',
    text: 'The products are divine. The shampoo soap bar makes my hair feel amazing.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-13',
    customerName: 'Karli A',
    text: 'Love the handmade organic soaps and lotions. Beautiful and chemical-free.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-14',
    customerName: 'Ness S',
    text: 'For someone with eczema, these products are 5 star :)',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-15',
    customerName: 'Sally W',
    text: 'I love the soaps and face sprays — especially when kept in the fridge in summer.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-16',
    customerName: 'Youngiu A',
    text: 'The FAMILY TENDER cream is incredible. Works where nothing else did. Highly recommend.',
    isVisible: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_MARKETING: MarketingContentRecord = {
  homepageHeroHeading: 'Calm, considered skincare by By Celeste',
  homepageSubtext:
    'Small-batch skincare rooted in regional Victoria — honest formulas and the warmth of local events.',
  homepageTagline: 'Traditional, Natural Exceptional Skincare',
  featuredProductsHeading: 'Featured products',
  ingredientsSectionHeading: 'Our Ingredients',
  ingredientsSectionText:
    'We formulate with thoughtfully selected ingredients that support calm, healthy skin.',
  testimonialsSectionHeading: 'What Our Customers Say',
  testimonialsSectionSubheading:
    'A few recent words from customers who use By Celeste every day.',
  facebookUrl: 'https://www.facebook.com',
  footerTrustWording: 'Handcrafted in regional Victoria · Boutique Australian skincare',
  updatedAt: new Date().toISOString(),
}

const DEFAULT_THEME: ThemeSettingsRecord = {
  primaryBrandColor: '#171717',
  secondaryBrandColor: '#64748b',
  buttonStyleEmphasis: 'solid',
  homepageHeroEmphasis: true,
  trustBadgesVisible: true,
  trustBadgeHeading: 'Trusted by our community',
  headerLogoPath: '',
  footerLogoPath: '',
  trustBadgeIconPath: '',
  updatedAt: new Date().toISOString(),
}

const DEFAULT_BUSINESS: BusinessSettingsRecord = {
  businessDisplayName: 'By Celeste',
  footerLocationWording: 'Leneva Victoria, Australia',
  footerSupportText:
    'For order questions, use the details on your confirmation or reach out through your account when signed in.',
  facebookUrl: 'https://www.facebook.com',
  trustStripWording: 'Handcrafted in regional Victoria · Boutique Australian skincare',
  shippingMethodLabel: 'Flat rate shipping',
  shippingAmountDisplay: '$12.00',
  shippingCarrierWording: 'Australia Post',
  shippingExplanatoryNote: 'Flat-rate shipping applies to all domestic orders.',
  australiaPostCarrierWording: 'Australia Post (standard)',
  updatedAt: new Date().toISOString(),
}

function defaultDb(): ContentDb {
  return {
    testimonials: DEFAULT_TESTIMONIALS,
    marketing: DEFAULT_MARKETING,
    theme: DEFAULT_THEME,
    business: DEFAULT_BUSINESS,
  }
}

async function ensureDbFile() {
  await fs.mkdir(CONTENT_DIR, { recursive: true })
  try {
    await fs.access(CONTENT_FILE)
  } catch {
    await fs.writeFile(CONTENT_FILE, JSON.stringify(defaultDb(), null, 2), 'utf-8')
  }
}

function isBootstrapTwoTestimonials(value: unknown): value is TestimonialRecord[] {
  if (!Array.isArray(value) || value.length !== 2) return false
  const names = value.map((v) => (typeof v?.customerName === 'string' ? v.customerName : ''))
  return names.includes('Linda H') && names.includes('Vicki M')
}

export async function readContentDb(): Promise<ContentDb> {
  await ensureDbFile()
  const raw = await fs.readFile(CONTENT_FILE, 'utf-8')
  const parsed = JSON.parse(raw) as Partial<ContentDb>
  const testimonials = isBootstrapTwoTestimonials(parsed.testimonials)
    ? DEFAULT_TESTIMONIALS
    : (parsed.testimonials ?? DEFAULT_TESTIMONIALS)
  return {
    testimonials,
    marketing: parsed.marketing ?? DEFAULT_MARKETING,
    theme: parsed.theme ?? DEFAULT_THEME,
    business: parsed.business ?? DEFAULT_BUSINESS,
  }
}

export async function writeContentDb(db: ContentDb) {
  await ensureDbFile()
  await fs.writeFile(CONTENT_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

/** Overwrites `data/content/content.json` with bundled demo defaults (local dev only). */
export async function resetLocalContentFileToDefaults(): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true })
  await fs.writeFile(CONTENT_FILE, JSON.stringify(defaultDb(), null, 2), 'utf-8')
}
