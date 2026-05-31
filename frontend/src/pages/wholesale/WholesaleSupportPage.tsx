import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicBusinessSettings, type BusinessSettings } from '../../features/content/contentApi'
import { BUSINESS_DETAILS } from '../../config/businessDetails'
import { FooterSocialLinks } from '../../components/layout/FooterSocialLinks'
import { WS_PRIMARY, WS_SECONDARY } from './wholesaleUi'

export function WholesaleSupportPage() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    getPublicBusinessSettings()
      .then((b) => {
        if (!cancelled) setBusiness(b)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Wholesale Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">Support</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">
          Help for wholesale ordering and your account. Approved accounts pay 50% of retail and can
          buy products only — not list or sell on this site.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Orders and account</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-neutral-700">
          <li>Order status, totals, and line items: use My Orders from the portal menu.</li>
          <li>Business name, ABN, and approval: use My Account.</li>
          <li>Order confirmations list the best contact path for that shipment.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700">
          <a
            href={`mailto:${BUSINESS_DETAILS.supportEmail}`}
            className="font-medium text-neutral-900 underline underline-offset-2"
          >
            {BUSINESS_DETAILS.supportEmail}
          </a>
        </p>
        {business?.footerSupportText ? (
          <p className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
            {business.footerSupportText}
          </p>
        ) : null}
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Social</p>
          <div className="mt-2">
            <FooterSocialLinks
              facebookUrl={business?.facebookUrl}
              instagramUrl={business?.instagramUrl}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/wholesale/orders" className={WS_PRIMARY}>
            My orders
          </Link>
          <Link to="/wholesale/shop" className={WS_SECONDARY}>
            Wholesale shop
          </Link>
        </div>
      </div>
    </div>
  )
}
