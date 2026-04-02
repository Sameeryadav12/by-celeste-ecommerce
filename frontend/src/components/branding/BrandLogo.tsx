import { useCallback, useState } from 'react'
import { BRANDING_LOGO_SRC_CHAIN } from '../../config/brandingLogos'

/**
 * Header: larger for stronger brand presence.
 * Footer: still substantial for brand consistency.
 * object-contain + max-width prevents navbar overflow.
 */
const variantClasses = {
  header:
    'h-10 max-h-10 w-auto max-w-[min(12.5rem,52vw)] shrink-0 object-contain object-left sm:h-12 sm:max-h-12 sm:max-w-[15rem] lg:h-14 lg:max-h-14 lg:max-w-[18rem]',
  footer:
    'h-8 max-h-8 w-auto max-w-[11rem] shrink-0 object-contain object-left sm:h-9 sm:max-h-9 sm:max-w-[12.5rem]',
} as const

type BrandLogoProps = {
  variant?: keyof typeof variantClasses
  showTextFallback?: boolean
  className?: string
  srcOverride?: string | null
}

export function BrandLogo({
  variant = 'header',
  showTextFallback = true,
  className = '',
  srcOverride = null,
}: BrandLogoProps) {
  const [index, setIndex] = useState(0)

  const handleError = useCallback(() => {
    setIndex((i) => i + 1)
  }, [])

  const sourceChain = srcOverride ? [srcOverride, ...BRANDING_LOGO_SRC_CHAIN] : BRANDING_LOGO_SRC_CHAIN

  if (index >= sourceChain.length) {
    if (!showTextFallback) return null
    return (
      <span
        className={`font-semibold tracking-tight text-neutral-900 ${variant === 'footer' ? 'text-sm' : 'text-base'} ${className}`}
      >
        By Celeste
      </span>
    )
  }

  const src = sourceChain[index]

  return (
    <img
      src={src}
      alt="By Celeste Logo"
      width={200}
      height={48}
      decoding="async"
      loading={variant === 'header' ? 'eager' : 'lazy'}
      fetchPriority={variant === 'header' ? 'high' : 'auto'}
      className={`${variantClasses[variant]} ${className}`}
      onError={handleError}
    />
  )
}
