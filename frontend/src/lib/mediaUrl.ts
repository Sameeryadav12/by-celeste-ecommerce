import { getApiBaseUrl } from './api'

/** Root-relative upload paths are served by the API host. */
export function resolveMediaUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/uploads/')) {
    const base = getApiBaseUrl()
    return base ? `${base}${trimmed}` : trimmed
  }
  return trimmed
}
