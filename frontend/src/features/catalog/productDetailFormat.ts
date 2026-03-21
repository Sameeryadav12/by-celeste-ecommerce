/** Two-sentence max overview from long marketing description (scannable PDP). */
export function briefProductOverview(description: string, maxSentences = 2): string {
  const normalized = description.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  const parts = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
  if (!parts || parts.length === 0) {
    return normalized.length > 220 ? `${normalized.slice(0, 217)}…` : normalized
  }

  const sentences = parts.map((s) => s.trim()).filter(Boolean)
  return sentences.slice(0, maxSentences).join(' ')
}

/** Turn how-to copy into ordered steps for display. */
export function howToUseSteps(howToUse: string): string[] {
  const lines = howToUse
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)

  if (lines.length > 1) return lines

  const single = lines[0] ?? howToUse.trim()
  if (!single) return []

  const bySentence = single
    .split(/\.\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((s) => (s.endsWith('.') ? s : `${s}.`))

  return bySentence.length > 1 ? bySentence : [single]
}
