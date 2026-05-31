import { apiFetch } from '../../lib/api'

export type CreateCheckoutSessionBody = {
  cartItems: { productId: string; quantity: number }[]
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  suburb: string
  state: string
  postcode: string
  country: string
  notes?: string
  couponCode?: string
}

export type CreateCheckoutSessionResponse = {
  orderId: string
  checkoutUrl: string
  status: {
    orderStatus: string
    paymentStatus: string
  }
  totals: {
    subtotalAud: string
    discountAud?: string
    shippingAud: string
    totalAud: string
  }
  coupon?: { code: string; percentage: number } | null
}

export type CheckoutReadiness = {
  checkoutAvailable: boolean
  message: string | null
}

export function fetchCheckoutReadiness() {
  return apiFetch<CheckoutReadiness>('/api/checkout/readiness', { method: 'GET' })
}

export function createCheckoutSession(body: CreateCheckoutSessionBody) {
  return apiFetch<CreateCheckoutSessionResponse>('/api/checkout/create-session', {
    method: 'POST',
    body,
  })
}

export type OrderStatusResponse = {
  orderId: string
  orderNumber: number
  orderRef: string
  status: string
  paymentStatus: string
  totalAmount: string
  currency: string
  updatedAt: string
}

export function fetchOrderStatus(orderId: string) {
  return apiFetch<OrderStatusResponse>(`/api/orders/${orderId}/status`)
}
