import { BUSINESS_DETAILS } from './businessDetails'

export const POLICY_PENDING_NOTE = 'Final wording to be confirmed by By Celeste.'

export const POLICIES: Record<
  string,
  { title: string; description: string; paragraphs: string[] }
> = {
  shipping: {
    title: 'Shipping policy',
    description: 'How By Celeste ships orders within Australia.',
    paragraphs: [
      'Domestic orders use flat-rate shipping of $12 per order via Australia Post (standard).',
      'There is no free shipping threshold and no bulk shipping discount.',
      POLICY_PENDING_NOTE,
    ],
  },
  returns: {
    title: 'Returns & refunds',
    description: 'Returns and refund information for By Celeste orders.',
    paragraphs: [
      `Contact us at ${BUSINESS_DETAILS.supportEmail} with your order number if something arrives damaged or incorrect.`,
      POLICY_PENDING_NOTE,
    ],
  },
  privacy: {
    title: 'Privacy policy',
    description: 'How By Celeste handles personal information.',
    paragraphs: [
      'We collect information you provide when you create an account, place an order, or contact us.',
      'We use your details to fulfil orders, provide support, and improve our services.',
      POLICY_PENDING_NOTE,
    ],
  },
  terms: {
    title: 'Terms & conditions',
    description: 'Terms for using the By Celeste website and placing orders.',
    paragraphs: [
      'By using this website you agree to these terms and our policies.',
      'Prices are in AUD unless stated otherwise. We may update product information and pricing.',
      POLICY_PENDING_NOTE,
    ],
  },
  'wholesale-terms': {
    title: 'Wholesale terms',
    description: 'Terms for approved wholesale accounts.',
    paragraphs: [
      'Approved wholesale accounts receive 50% off the retail price shown on each product.',
      'Wholesale buyers may purchase products for their business only. They cannot list or resell products on this website.',
      'Applications are reviewed by By Celeste before wholesale pricing applies.',
      POLICY_PENDING_NOTE,
    ],
  },
}

export type PolicyHandoverStatus = 'Ready' | 'Needs final wording'

export function getPolicyHandoverStatuses(): Array<{
  slug: string
  label: string
  status: PolicyHandoverStatus
}> {
  return Object.entries(POLICIES).map(([slug, policy]) => ({
    slug,
    label: policy.title,
    status: policy.paragraphs.includes(POLICY_PENDING_NOTE)
      ? 'Needs final wording'
      : 'Ready',
  }))
}
