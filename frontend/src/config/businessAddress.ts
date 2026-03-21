/**
 * Client business address (postal / studio). Update here to change site-wide.
 */
export const BUSINESS_ADDRESS = {
  street: '10 Mortimer Tce',
  suburb: 'Leneva',
  state: 'VIC',
  postcode: '3691',
  country: 'Australia',
} as const

/** Single line for footer, About, etc. */
export function formatBusinessAddressLine(): string {
  const { street, suburb, state, postcode } = BUSINESS_ADDRESS
  return `${street}, ${suburb} ${state} ${postcode}`
}
