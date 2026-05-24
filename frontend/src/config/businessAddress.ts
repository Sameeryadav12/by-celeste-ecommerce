import { BUSINESS_DETAILS } from './businessDetails'

/** Public location wording (footer and SEO). */
export const BUSINESS_LOCATION = {
  locality: BUSINESS_DETAILS.addressShort,
  country: 'Australia',
  fullAddress: BUSINESS_DETAILS.addressLine,
} as const
