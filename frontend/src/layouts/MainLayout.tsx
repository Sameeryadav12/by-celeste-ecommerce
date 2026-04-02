import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'
import { useCart } from '../features/cart/CartContext'
import { BUSINESS_LOCATION } from '../config/businessAddress'
import { BrandLogo } from '../components/branding/BrandLogo'
import { TrustBadgeRow } from '../components/trust/TrustBadgeRow'
import { BrandIcon } from '../components/icons/BrandIcon'
import {
  getPublicBusinessSettings,
  getPublicMarketingContent,
  getPublicThemeSettings,
  type BusinessSettings,
  type MarketingContent,
  type ThemeSettings,
} from '../features/content/contentApi'

const primaryNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/wholesale', label: 'Wholesale' },
]

function NavItem({
  to,
  label,
  end,
  onClick,
}: {
  to: string
  label: string
  end?: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        ].join(' ')
      }
      end={end}
    >
      {label}
    </NavLink>
  )
}

const cartNavBase =
  'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 ease-out'
const cartNavDefault = 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
const cartNavFlash =
  'bg-emerald-50/95 text-emerald-950 ring-1 ring-emerald-200/80 shadow-sm'

export function MainLayout() {
  const { user, status, logout } = useAuth()
  const { summary, cartBumpVersion } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartFlash, setCartFlash] = useState(false)
  const [marketing, setMarketing] = useState<MarketingContent | null>(null)
  const [theme, setTheme] = useState<ThemeSettings | null>(null)
  const [business, setBusiness] = useState<BusinessSettings | null>(null)
  const prevBumpRef = useRef(cartBumpVersion)

  useEffect(() => {
    if (cartBumpVersion > prevBumpRef.current) {
      setCartFlash(true)
      const t = window.setTimeout(() => setCartFlash(false), 2000)
      prevBumpRef.current = cartBumpVersion
      return () => window.clearTimeout(t)
    }
    prevBumpRef.current = cartBumpVersion
  }, [cartBumpVersion])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getPublicMarketingContent(),
      getPublicThemeSettings(),
      getPublicBusinessSettings(),
    ])
      .then(([marketingData, themeData, businessData]) => {
        if (!cancelled) setMarketing(marketingData)
        if (!cancelled) setTheme(themeData)
        if (!cancelled) setBusiness(businessData)
      })
      .catch(() => {
        if (cancelled) return
        setMarketing(null)
        setTheme(null)
        setBusiness(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await logout()
    setMobileOpen(false)
    navigate('/login', { replace: true })
  }

  const isLoadingAuth = status === 'idle' || status === 'loading'

  return (
    <div
      className="min-h-screen bg-neutral-50 text-neutral-900"
      style={{
        '--brand-primary': theme?.primaryBrandColor || '#171717',
        '--brand-secondary': theme?.secondaryBrandColor || '#64748b',
      } as CSSProperties}
    >
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link
              to="/"
              className="flex min-h-0 min-w-0 shrink-0 items-center py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              <BrandLogo variant="header" srcOverride={theme?.headerLogoPath || undefined} />
            </Link>

            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-2 md:flex">
                {primaryNavItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    end={item.end}
                  />
                ))}
              </nav>

              <div className="hidden items-center gap-2 md:flex">
                <NavLink
                  to="/cart"
                  className={[cartNavBase, cartFlash ? cartNavFlash : cartNavDefault].join(' ')}
                >
                  Cart{summary.itemCount > 0 ? ` (${summary.itemCount})` : ''}
                </NavLink>

                {isLoadingAuth ? (
                  <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-200" />
                ) : user ? (
                  <>
                    <NavLink
                      to="/account"
                      className={({ isActive }) =>
                        [
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-neutral-900 text-white'
                            : 'border border-neutral-200/80 bg-neutral-50/90 text-neutral-900 shadow-sm hover:bg-neutral-100',
                        ].join(' ')
                      }
                    >
                      Account
                    </NavLink>
                    {user.role === 'ADMIN' ? (
                      <NavLink
                        to="/admin"
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200/80 transition hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        Admin
                      </NavLink>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md px-2 py-1 text-xs font-normal text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="rounded-md px-3 py-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
                    >
                      Login
                    </NavLink>
                    <Button
                      type="button"
                      variant="primary"
                      className="px-4 py-2 text-sm shadow-sm"
                      onClick={() => {
                        navigate('/signup')
                      }}
                    >
                      Signup
                    </Button>
                  </>
                )}
              </div>

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-800 md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="flex h-3.5 w-4 flex-col justify-between">
                  <span className="block h-0.5 w-full rounded bg-neutral-800" />
                  <span className="block h-0.5 w-full rounded bg-neutral-800" />
                  <span className="block h-0.5 w-full rounded bg-neutral-800" />
                </span>
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="pb-4 md:hidden">
              <nav className="space-y-1 border-t border-neutral-200 pt-3">
                {primaryNavItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
                <NavLink
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'block',
                    cartNavBase,
                    cartFlash ? cartNavFlash : cartNavDefault,
                  ].join(' ')}
                >
                  Cart{summary.itemCount > 0 ? ` (${summary.itemCount})` : ''}
                </NavLink>
                <div className="mt-2 border-t border-neutral-200 pt-2">
                  {isLoadingAuth ? (
                    <div className="h-9 w-28 animate-pulse rounded-md bg-neutral-200" />
                  ) : user ? (
                    <div className="flex flex-col gap-2">
                      <NavLink
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          [
                            'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-neutral-900 text-white'
                              : 'border border-neutral-200/80 bg-neutral-50/90 text-neutral-900 shadow-sm hover:bg-neutral-100',
                          ].join(' ')
                        }
                      >
                        Account
                      </NavLink>
                      {user.role === 'ADMIN' ? (
                        <NavLink
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200/80 hover:bg-neutral-100"
                        >
                          Admin portal
                        </NavLink>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="self-start rounded-md px-2 py-1 text-left text-xs font-normal text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <NavLink
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900"
                      >
                        Login
                      </NavLink>
                      <Button
                        type="button"
                        variant="primary"
                        className="py-2 text-sm"
                        onClick={() => {
                          setMobileOpen(false)
                          navigate('/signup')
                        }}
                      >
                        Signup
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          ) : null}
        </Container>
      </header>

      <main className="pb-10 pt-6 sm:pb-12 sm:pt-8">
        <Container>
          <Outlet />
        </Container>
      </main>

      {theme?.trustBadgesVisible !== false ? (
        <TrustBadgeRow heading={theme?.trustBadgeHeading || undefined} />
      ) : null}

      <footer className="border-t border-neutral-200 bg-white/80 py-10 text-sm text-neutral-700">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center">
                <BrandLogo variant="footer" srcOverride={theme?.footerLogoPath || undefined} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-800">
                {marketing?.homepageTagline || 'Traditional, Natural Exceptional Skincare'}
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-neutral-900">Quick links</div>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li>
                  <Link to="/shop" className="hover:text-neutral-900">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-neutral-900">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to="/testimonials" className="hover:text-neutral-900">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link to="/wholesale/apply" className="hover:text-neutral-900">
                    Wholesale and stockists
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-neutral-900">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-neutral-900">Contact</div>
              <address className="text-xs leading-5 text-neutral-600 not-italic">
                <span className="block font-medium text-neutral-800">
                  {business?.businessDisplayName || 'By Celeste'}
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  <BrandIcon name="location" className="h-3.5 w-3.5 shrink-0 opacity-50" alt="" />
                  {business?.footerLocationWording || `${BUSINESS_LOCATION.locality}, ${BUSINESS_LOCATION.country}`}
                </span>
              </address>
              <p className="text-xs leading-5 text-neutral-500">
                {business?.footerSupportText ||
                  'For order questions, use the details on your confirmation or reach out through your account when signed in.'}
              </p>
              <a
                href={business?.facebookUrl || marketing?.facebookUrl || 'https://www.facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
              >
                <BrandIcon name="facebook" className="h-3.5 w-3.5 shrink-0 opacity-60" alt="" />
                Facebook
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs leading-relaxed text-neutral-500">
            {business?.trustStripWording ||
              marketing?.footerTrustWording ||
              'Handcrafted in regional Victoria · Boutique Australian skincare'}
          </div>

          <div className="mt-4 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} By Celeste. All rights reserved.
          </div>
        </Container>
      </footer>
    </div>
  )
}

