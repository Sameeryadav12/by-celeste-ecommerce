export const SITE_ORIGIN = 'https://www.byceleste.com.au'

export const DEFAULT_OG_IMAGE_PATH = '/images/branding/Celeste logo.png'

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  if (!pathOrUrl.startsWith('/')) return `${SITE_ORIGIN}/${pathOrUrl}`
  return `${SITE_ORIGIN}${pathOrUrl}`
}

