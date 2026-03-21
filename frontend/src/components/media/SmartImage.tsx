import { useMemo, useState } from 'react'

export type SmartImageProps = {
  src: string
  alt: string
  /**
   * Wrapper is used so we can keep layout stable and show a skeleton until the image loads.
   * Pass `relative` if you want the skeleton overlay.
   */
  wrapperClassName: string
  /** Extra classes; base uses absolute fill + object-cover. */
  imgClassName?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  enableSkeleton?: boolean
}

export function SmartImage({
  src,
  alt,
  wrapperClassName,
  imgClassName = '',
  fallbackSrc = '/images/placeholder.svg',
  loading = 'lazy',
  enableSkeleton = true,
}: SmartImageProps) {
  const normalizedSrc = useMemo(() => (src ? src : fallbackSrc), [src, fallbackSrc])

  // Keying remounts this component on src change, so we don't need effects/state resets.
  return (
    <SmartImageInner
      key={normalizedSrc}
      src={normalizedSrc}
      alt={alt}
      wrapperClassName={wrapperClassName}
      imgClassName={imgClassName}
      fallbackSrc={fallbackSrc}
      loading={loading}
      enableSkeleton={enableSkeleton}
    />
  )
}

type SmartImageInnerProps = {
  src: string
  alt: string
  wrapperClassName: string
  imgClassName?: string
  fallbackSrc: string
  loading: 'lazy' | 'eager'
  enableSkeleton: boolean
}

function SmartImageInner({
  src,
  alt,
  wrapperClassName,
  imgClassName,
  fallbackSrc,
  loading,
  enableSkeleton,
}: SmartImageInnerProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  function handleError() {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setLoaded(false)
      setErrored(false)
      return
    }
    setErrored(true)
  }

  return (
    <div className={wrapperClassName}>
      {enableSkeleton && !loaded ? (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" aria-hidden />
      ) : null}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={[
          'absolute inset-0 h-full w-full object-cover',
          imgClassName?.trim(),
          loaded ? 'opacity-100' : 'opacity-0',
          errored ? 'opacity-100' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  )
}

