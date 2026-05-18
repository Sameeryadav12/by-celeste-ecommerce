/**
 * Truncate copy at the last whole word before maxLength (never mid-word).
 */
export function truncateAtWord(text: string, maxLength: number): { text: string; wasTruncated: boolean } {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length <= maxLength) {
    return { text: trimmed, wasTruncated: false }
  }

  const slice = trimmed.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(' ')
  const cutIndex = lastSpace > 0 ? lastSpace : maxLength
  const shortened = slice.slice(0, cutIndex).trimEnd()

  return {
    text: shortened.length > 0 ? `${shortened}…` : `${trimmed.slice(0, maxLength)}…`,
    wasTruncated: true,
  }
}
