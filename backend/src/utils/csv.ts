/** Escape a value for CSV (RFC-style quoting). */
export function csvCell(value: string | number | boolean | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCsvRow(cells: Array<string | number | boolean | null | undefined>): string {
  return cells.map(csvCell).join(',')
}
