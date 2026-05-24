import type { Request, Response } from 'express'

export function wantsCsvFormat(query: Request['query']): boolean {
  const raw = query.format
  if (raw == null) return false
  const value = Array.isArray(raw) ? String(raw[0]) : String(raw)
  return value.toLowerCase() === 'csv'
}

/** Send raw CSV bytes — never JSON-wrapped. */
export function sendCsvAttachment(res: Response, filename: string, csvBody: string) {
  const body = csvBody.startsWith('\uFEFF') ? csvBody : `\uFEFF${csvBody}`
  res.status(200)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Cache-Control', 'no-store')
  res.send(body)
}
