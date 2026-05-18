import { useCallback, useEffect, useState } from 'react'
import { BRANDING_LOGO_SRC_CHAIN } from '../../config/brandingLogos'

/** Opaque rasters: drop-shadow “outline” follows the full image rectangle, not the glyph. */
function looksLikeOpaqueRasterLogo(src: string): boolean {
  const pathOnly = src.split('?')[0]?.split('#')[0] ?? src
  return /\.(jpe?g|bmp)$/i.test(pathOnly)
}

/** Shared mark sizing — header and footer use the same asset and scale for a consistent brand lockup. */
const brandMarkSizeClasses =
  'h-16 max-h-16 w-auto max-w-[min(22rem,82vw)] shrink-0 object-contain object-left sm:h-[4.5rem] sm:max-h-[4.5rem] sm:max-w-[26rem] md:h-20 md:max-h-20 md:max-w-[30rem] lg:h-24 lg:max-h-24 lg:max-w-[34rem]'

const variantClasses = {
  header: brandMarkSizeClasses,
  footer: brandMarkSizeClasses,
} as const

type BrandLogoProps = {
  variant?: keyof typeof variantClasses
  showTextFallback?: boolean
  className?: string
  srcOverride?: string | null
  /** Subtle CSS outline via drop-shadow (transparent PNG/SVG). Default true. */
  outlined?: boolean
}

export function BrandLogo({
  variant = 'header',
  showTextFallback = true,
  className = '',
  srcOverride = null,
  outlined,
}: BrandLogoProps) {
  const [index, setIndex] = useState(0)

  const handleError = useCallback(() => {
    setIndex((i) => i + 1)
  }, [])

  const sourceChain = srcOverride ? [srcOverride, ...BRANDING_LOGO_SRC_CHAIN] : BRANDING_LOGO_SRC_CHAIN

  useEffect(() => {
    setIndex(0)
  }, [srcOverride])

  if (index >= sourceChain.length) {
    if (!showTextFallback) return null
    const fallbackSize = 'text-2xl tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]'
    const outlineText = outlined !== false ? 'brand-logo--outlined-text' : ''
    return (
      <span
        className={`inline-flex font-semibold text-neutral-900 ${fallbackSize} ${outlineText} ${className}`.trim()}
      >
        By Celeste
      </span>
    )
  }

  const src = sourceChain[index]

  const useOutline = outlined !== false && !looksLikeOpaqueRasterLogo(src)
  const outlineClass = 'brand-logo--outlined'

  return (
    <span
      className={
        useOutline
          ? `${outlineClass} ${className}`.trim()
          : `inline-flex leading-none ${className}`.trim()
      }
    >
      <img
        src={src}
        alt="By Celeste Logo"
        width={420}
        height={105}
        decoding="async"
        loading={variant === 'header' ? 'eager' : 'lazy'}
        fetchPriority={variant === 'header' ? 'high' : 'auto'}
        className={variantClasses[variant]}
        onError={handleError}
      />
    </span>
  )
}
