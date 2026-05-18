import { BRANDING_LOGO_SRC_CHAIN } from '../../config/brandingLogos'

type BrandLogoWatermarkProps = {
  /** Theme header path, then footer path, then default branding file. */
  srcOverride?: string | null
}

/**
 * Fixed, low-opacity brand mark behind page content — stays in place while scrolling.
 */
export function BrandLogoWatermark({ srcOverride }: BrandLogoWatermarkProps) {
  const src =
    srcOverride?.trim() ||
    BRANDING_LOGO_SRC_CHAIN[0] ||
    '/images/branding/Celeste%20logo.png'

  return (
    <div
      aria-hidden
      className="brand-watermark pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="flex h-full w-full items-center justify-center px-8 pt-20 pb-12 sm:px-12 sm:pt-24">
        <img
          src={src}
          alt=""
          width={640}
          height={160}
          decoding="async"
          loading="lazy"
          className="max-h-[min(68vh,540px)] w-full max-w-[min(88vw,680px)] object-contain opacity-[0.16] select-none sm:max-w-[min(82vw,720px)] sm:opacity-[0.175] md:opacity-[0.18]"
        />
      </div>
    </div>
  )
}
