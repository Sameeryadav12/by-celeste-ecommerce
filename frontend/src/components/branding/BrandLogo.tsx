import { useCallback, useEffect, useState } from 'react'
import { BRANDING_LOGO_SRC_CHAIN } from '../../config/brandingLogos'

/**
 * Header: primary visual mark. Footer: strong supporting mark (still smaller than header on lg).
 * object-contain + max-width keeps aspect ratio and avoids overflow.
 */
const variantClasses = {
  header:
    'h-[52px] max-h-[52px] w-auto max-w-[min(20rem,78vw)] shrink-0 object-contain object-left sm:h-[58px] sm:max-h-[58px] sm:max-w-[22rem] md:h-[72px] md:max-h-[72px] md:max-w-[26rem] lg:h-[80px] lg:max-h-[80px] lg:max-w-[30rem]',
  footer:
    'h-14 max-h-14 w-auto max-w-[min(19rem,88vw)] shrink-0 object-contain object-left sm:h-16 sm:max-h-16 sm:max-w-[21rem] md:h-[4.25rem] md:max-h-[4.25rem] md:max-w-[23rem] lg:h-[4.75rem] lg:max-h-[4.75rem] lg:max-w-[25rem]',
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

  useEffect(() => {
    setIndex(0)
  }, [srcOverride])

  if (index >= sourceChain.length) {
    if (!showTextFallback) return null
    const fallbackSize =
      variant === 'footer'
        ? 'text-xl tracking-tight sm:text-2xl md:text-3xl lg:text-[2.125rem]'
        : 'text-2xl tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]'
    return (
      <span className={`font-semibold text-neutral-900 ${fallbackSize} ${className}`}>By Celeste</span>
    )
  }

  const src = sourceChain[index]

  return (
    <img
      src={src}
      alt="By Celeste Logo"
      width={320}
      height={80}
      decoding="async"
      loading={variant === 'header' ? 'eager' : 'lazy'}
      fetchPriority={variant === 'header' ? 'high' : 'auto'}
      className={`${variantClasses[variant]} ${className}`}
      onError={handleError}
    />
  )
}
