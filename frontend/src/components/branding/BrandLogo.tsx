import { useCallback, useState } from 'react'
import { BRANDING_LOGO_SRC_CHAIN } from '../../config/brandingLogos'

/**
 * Header: 32px mobile, 40px sm+, up to 48px lg.
 * Footer: smaller, subtle.
 * object-contain + max-width prevents navbar overflow.
 */
const variantClasses = {
  header:
    'h-8 max-h-8 w-auto max-w-[min(10.5rem,46vw)] shrink-0 object-contain object-left sm:h-10 sm:max-h-10 sm:max-w-[13rem] lg:h-12 lg:max-h-12 lg:max-w-[15rem]',
  footer:
    'h-6 max-h-6 w-auto max-w-[8.5rem] shrink-0 object-contain object-left sm:h-7 sm:max-h-7 sm:max-w-[10rem]',
} as const

type BrandLogoProps = {
  variant?: keyof typeof variantClasses
  showTextFallback?: boolean
  className?: string
}

export function BrandLogo({
  variant = 'header',
  showTextFallback = true,
  className = '',
}: BrandLogoProps) {
  const [index, setIndex] = useState(0)

  const handleError = useCallback(() => {
    setIndex((i) => i + 1)
  }, [])

  if (index >= BRANDING_LOGO_SRC_CHAIN.length) {
    if (!showTextFallback) return null
    return (
      <span
        className={`font-semibold tracking-tight text-neutral-900 ${variant === 'footer' ? 'text-sm' : 'text-base'} ${className}`}
      >
        By Celeste
      </span>
    )
  }

  const src = BRANDING_LOGO_SRC_CHAIN[index]

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
