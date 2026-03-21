import { useEffect, type ReactNode } from 'react'

export type SeoProps = {
  title: string
  description?: string
  canonicalUrl?: string
  openGraph?: {
    imageUrl?: string
  }
  jsonLd?: unknown
  children?: ReactNode
}

function upsertMeta(options: { name?: string; property?: string }, content: string) {
  if (typeof document === 'undefined') return

  const selector = options.name
    ? `meta[name="${options.name}"]`
    : `meta[property="${options.property}"]`

  const existing = document.head.querySelector(selector) as HTMLMetaElement | null

  if (existing) {
    existing.setAttribute('content', content)
    return
  }

  const meta = document.createElement('meta')
  if (options.name) meta.setAttribute('name', options.name)
  if (options.property) meta.setAttribute('property', options.property)
  meta.setAttribute('content', content)
  document.head.appendChild(meta)
}

export function Seo({ title, description, canonicalUrl, openGraph, jsonLd }: SeoProps) {
  const computedCanonical =
    canonicalUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined)

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.title = title

    if (description) {
      upsertMeta({ name: 'description' }, description)
    }

    if (computedCanonical) {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', computedCanonical)

      upsertMeta({ property: 'og:url' }, computedCanonical)
    }

    upsertMeta({ property: 'og:type' }, 'website')
    upsertMeta({ property: 'og:title' }, title)
    if (description) upsertMeta({ property: 'og:description' }, description)

    if (openGraph?.imageUrl) {
      upsertMeta({ property: 'og:image' }, openGraph.imageUrl)
    }

    // Simple Twitter card for better previews.
    upsertMeta({ name: 'twitter:card' }, 'summary')
    upsertMeta({ name: 'twitter:title' }, title)
    if (description) upsertMeta({ name: 'twitter:description' }, description)
  }, [canonicalUrl, computedCanonical, description, openGraph?.imageUrl, title])

  return (
    <>
      {jsonLd ? (
        <script
          id="__seo-jsonld"
          type="application/ld+json"
          // Keeping it simple: overwrite the same script tag on each page.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </>
  )
}

