export const ORDER_NUMBER_PREFIX = 'BC'
export const ORDER_NUMBER_START = 1000

export function formatOrderNumber(orderNumber: number): string {
  return `${ORDER_NUMBER_PREFIX}-${orderNumber}`
}

export function parseOrderNumberQuery(raw: string): number | null {
  const trimmed = raw.trim()
  const match = trimmed.match(/^BC-?(\d+)$/i)
  if (!match) return null
  const n = Number.parseInt(match[1], 10)
  return Number.isFinite(n) ? n : null
}
