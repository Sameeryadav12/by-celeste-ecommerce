/** Display wholesale column: stored value or 50% of retail (site rule). */
export function adminWholesaleDisplay(
  retail: string,
  wholesalePrice: string | null,
): { text: string; derived: boolean } {
  if (wholesalePrice) {
    return { text: formatAud(wholesalePrice), derived: false }
  }
  const n = Number(retail)
  if (!Number.isFinite(n)) return { text: '—', derived: false }
  return { text: formatAud((n * 0.5).toFixed(2)), derived: true }
}

function formatAud(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n)
}
