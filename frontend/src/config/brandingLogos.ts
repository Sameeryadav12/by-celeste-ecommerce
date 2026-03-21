/**
 * Client logo files under `public/images/branding/`.
 * First match wins. Filenames are URL-encoded for paths (e.g. spaces → %20).
 *
 * Optional: add `logo-on-light-bg.png` if the primary mark is too light on the white header.
 */
const LOGO_FILENAMES = [
  'Celeste logo.jpg',
  'logo-on-light-bg.png',
  'logo-on-light-bg.svg',
  'logo.svg',
  'logo.png',
  'logo.webp',
] as const

export const BRANDING_LOGO_SRC_CHAIN: readonly string[] = LOGO_FILENAMES.map(
  (name) => `/images/branding/${encodeURIComponent(name)}`,
)
