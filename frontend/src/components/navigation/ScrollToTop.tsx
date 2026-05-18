import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll window to top on every route change (SPA navigation). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '')
      const target = id ? document.getElementById(id) : null
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, hash])

  return null
}
