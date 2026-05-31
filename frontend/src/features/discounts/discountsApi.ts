import { apiFetch } from '../../lib/api'

export type CouponValidationSuccess = {
  valid: true
  message: string
  code: string
  percentage: number
  /** Decimal string, AUD with 2 fraction digits. */
  discountAmount: string
  subtotalAfterDiscount: string
}

export type ValidateCouponBody = {
  code: string
  subtotal: number
  userEmail?: string
  isWholesale?: boolean
}

export function normaliseCouponCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

/** Throws `ApiRequestError` (with the server-supplied friendly message) on rejection. */
export async function validateCoupon(body: ValidateCouponBody): Promise<CouponValidationSuccess> {
  return apiFetch<CouponValidationSuccess>('/api/discounts/validate', {
    method: 'POST',
    body: {
      code: normaliseCouponCode(body.code),
      subtotal: Number(body.subtotal.toFixed(2)),
      ...(body.userEmail ? { userEmail: body.userEmail } : {}),
      isWholesale: Boolean(body.isWholesale),
    },
  })
}
