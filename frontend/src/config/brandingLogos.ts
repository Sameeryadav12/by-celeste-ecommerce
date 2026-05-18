/**
 * Client logo files under `public/images/branding/`.
 * First match wins. Filenames are URL-encoded for paths (e.g. spaces → %20).
 *
 * Primary mark: **`Celeste logo.png`**. Then alternates and generics; **`Celeste logo.jpg`**
 * last (opaque JPEG — poor on white header; kept as fallback only).
 */
const LOGO_FILENAMES = [
  'Celeste logo.png',
  'logo-on-light-bg.png',
  'logo-on-light-bg.svg',
  'logo.svg',
  'logo.png',
  'logo.webp',
  'Celeste logo.jpg',
] as const

export const BRANDING_LOGO_SRC_CHAIN: readonly string[] = LOGO_FILENAMES.map(
  (name) => `/images/branding/${encodeURIComponent(name)}`,
)
