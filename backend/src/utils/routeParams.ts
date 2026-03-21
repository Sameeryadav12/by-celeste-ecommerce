/**
 * Express 5 may type params as string | string[]; normalize to a single string.
 */
export function paramString(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined
  if (Array.isArray(value)) return value[0]
  return value
}
