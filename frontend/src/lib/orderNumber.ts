export function formatOrderNumber(orderNumber: number | null | undefined): string {
  if (orderNumber == null || !Number.isFinite(orderNumber)) return '—'
  return `BC-${orderNumber}`
}
