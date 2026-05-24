import { BrandIcon } from '../icons/BrandIcon'

const linkClass =
  'inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900'

export function safeSocialUrl(url?: string | null): string | null {
  const t = url?.trim()
  if (!t) return null
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  return null
}

export function FooterSocialLinks({
  facebookUrl,
  instagramUrl,
}: {
  facebookUrl?: string | null
  instagramUrl?: string | null
}) {
  const fb = safeSocialUrl(facebookUrl)
  const ig = safeSocialUrl(instagramUrl)
  if (!fb && !ig) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {fb ? (
        <a href={fb} target="_blank" rel="noreferrer" className={linkClass}>
          <BrandIcon name="facebook" className="h-3.5 w-3.5 shrink-0 opacity-60" alt="" />
          Facebook
        </a>
      ) : null}
      {ig ? (
        <a href={ig} target="_blank" rel="noreferrer" className={linkClass}>
          <BrandIcon name="instagram" className="h-3.5 w-3.5 shrink-0 opacity-60" alt="" />
          Instagram
        </a>
      ) : null}
    </div>
  )
}
