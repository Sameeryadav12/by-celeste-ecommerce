import { BUSINESS_DETAILS } from '../../../config/businessDetails'

export function WholesaleSupportCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Wholesale support</h2>
      <p className="mt-2 text-sm text-neutral-700">For wholesale questions, contact By Celeste.</p>
      <a
        href={`mailto:${BUSINESS_DETAILS.supportEmail}`}
        className="mt-2 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2"
      >
        {BUSINESS_DETAILS.supportEmail}
      </a>
    </div>
  )
}
