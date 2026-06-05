import fs from 'node:fs/promises'
import path from 'node:path'

import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITE_ORIGIN = 'https://www.byceleste.com.au'

const apiBaseUrl = process.env.VITE_API_BASE_URL?.trim()

const POLICY_SLUGS = ['shipping', 'returns', 'privacy', 'terms', 'wholesale-terms']

function isoDateOnly(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function fetchAllProducts() {
  if (!apiBaseUrl) return []
  const limit = 100
  let page = 1
  let totalPages = 1
  const products = []

  while (page <= totalPages) {
    const url = `${apiBaseUrl}/api/products?page=${page}&limit=${limit}&sort=name_asc`
    const json = await fetchJson(url)
    const data = json?.data
    const items = data?.products ?? []
    const pagination = data?.pagination
    totalPages = pagination?.totalPages ?? totalPages
    products.push(...items)
    page += 1
  }

  return products
}

async function fetchAllEvents() {
  if (!apiBaseUrl) return []
  const limit = 100
  let page = 1
  let totalPages = 1
  const events = []

  while (page <= totalPages) {
    const url = `${apiBaseUrl}/api/events?page=${page}&limit=${limit}`
    const json = await fetchJson(url)
    const data = json?.data
    const items = data?.events ?? []
    const pagination = data?.pagination
    totalPages = pagination?.totalPages ?? totalPages
    events.push(...items)
    page += 1
  }

  return events
}

function urlEntry(loc) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${isoDateOnly()}</lastmod>\n  </url>`
}

async function generateSitemapXml() {
  const urls = new Set()

  // Core public pages.
  urls.add(`${SITE_ORIGIN}/`)
  urls.add(`${SITE_ORIGIN}/shop`)
  urls.add(`${SITE_ORIGIN}/about`)
  urls.add(`${SITE_ORIGIN}/testimonials`)
  urls.add(`${SITE_ORIGIN}/events`)

  for (const slug of POLICY_SLUGS) {
    urls.add(`${SITE_ORIGIN}/policies/${slug}`)
  }

  // Products + events.
  const [products, events] = await Promise.allSettled([fetchAllProducts(), fetchAllEvents()])
  if (products.status === 'fulfilled') {
    for (const p of products.value) {
      if (!p?.slug) continue
      if (p?.isActive === false) continue
      urls.add(`${SITE_ORIGIN}/shop/${p.slug}`)
    }
  } else {
    console.warn('[sitemap] products fetch failed:', products.reason?.message ?? products.reason)
  }

  if (events.status === 'fulfilled') {
    for (const e of events.value) {
      if (!e?.slug) continue
      if (e?.isPublished === false) continue
      urls.add(`${SITE_ORIGIN}/events/${e.slug}`)
    }
  } else {
    console.warn('[sitemap] events fetch failed:', events.reason?.message ?? events.reason)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${Array.from(urls)
      .sort()
      .map((loc) => urlEntry(loc))
      .join('\n')}\n` +
    `</urlset>\n`
}

async function main() {
  const distDir = path.join(__dirname, '..', 'dist')
  const outPath = path.join(distDir, 'sitemap.xml')

  try {
    const xml = await generateSitemapXml()
    await fs.writeFile(outPath, xml, 'utf8')
    console.log('[sitemap] Generated sitemap.xml')
  } catch (e) {
    console.warn('[sitemap] Failed, writing minimal sitemap only.')
    const minimal = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${urlEntry(`${SITE_ORIGIN}/`)}\n` +
      `${urlEntry(`${SITE_ORIGIN}/shop`)}\n` +
      `${urlEntry(`${SITE_ORIGIN}/about`)}\n` +
      `${urlEntry(`${SITE_ORIGIN}/testimonials`)}\n` +
      `${urlEntry(`${SITE_ORIGIN}/events`)}\n` +
      `${POLICY_SLUGS.map((s) => urlEntry(`${SITE_ORIGIN}/policies/${s}`)).join('\n')}\n` +
      `</urlset>\n`
    await fs.writeFile(outPath, minimal, 'utf8')
  }
}

main()

