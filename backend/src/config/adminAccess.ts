import { BUSINESS_DETAILS } from './businessDetails'

/** Normalised email allowed to sign in as administrator. */
export const CANONICAL_ADMIN_EMAIL = BUSINESS_DETAILS.adminEmail.trim().toLowerCase()

export function isCanonicalAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === CANONICAL_ADMIN_EMAIL
}
