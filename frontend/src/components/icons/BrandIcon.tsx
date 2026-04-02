import { useState } from 'react'

interface BrandIconProps {
  name: string
  className?: string
  alt?: string
}

/**
 * Renders an SVG icon from /icons/{name}.svg.
 * Hides gracefully if the file is missing — layout stays intact.
 * To swap an icon, replace the file in frontend/public/icons/.
 */
export function BrandIcon({ name, className = 'h-6 w-6', alt = '' }: BrandIconProps) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  return (
    <img
      src={`/icons/${name}.svg`}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setHidden(true)}
    />
  )
}
