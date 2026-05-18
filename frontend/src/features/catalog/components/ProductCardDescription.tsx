import { truncateAtWord } from '../../../utils/truncateAtWord'

/** ~3 lines on a typical product card column; tuned so line-clamp rarely cuts mid-word. */
const CARD_BLURB_MAX_CHARS = 156

/**
 * Product card blurbs: even height, word-safe ellipsis, full text on hover when trimmed.
 */
export function ProductCardDescription({ text }: { text: string }) {
  const trimmed = text.trim()
  if (!trimmed) return null

  const { text: display, wasTruncated } = truncateAtWord(trimmed, CARD_BLURB_MAX_CHARS)

  return (
    <p
      className="min-h-[4.25rem] text-sm leading-relaxed text-neutral-700"
      title={wasTruncated ? trimmed : undefined}
    >
      {display}
    </p>
  )
}
