/** Production business details (client handover). */
export const BUSINESS_DETAILS = {
  name: 'By Celeste',
  abn: '42 491 484 966',
  /** Admin portal login only — no other email may access `/admin`. */
  adminEmail: 'admin.byceleste@gmail.com',
  /** Customer, wholesale, and public support contact. */
  supportEmail: 'jane.byceleste@gmail.com',
  phone: '0403 823 357',
  addressLine: '10 Mortimer Tce, Leneva VIC 3691',
  website: 'www.byceleste.com.au',
  websiteUrl: 'https://www.byceleste.com.au',
} as const
