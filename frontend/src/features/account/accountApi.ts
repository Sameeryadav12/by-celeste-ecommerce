import { apiFetch } from '../../lib/api'
import type { AuthUser } from '../../auth/authTypes'

export type AccountOrderSummary = {
  id: string
  createdAt: string
  status: string
  paymentStatus: string
  totalAmount: string
  itemCount: number
}

export type AccountOrderDetail = {
  id: string
  createdAt: string
  updatedAt: string
  status: string
  paymentStatus: string
  subtotalAmount: string
  shippingAmount: string
  totalAmount: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  shipping: {
    addressLine1: string
    addressLine2: string | null
    suburb: string
    state: string
    postcode: string
    country: string
  }
  notes: string | null
  items: {
    id: string
    productId: string
    name: string
    slug: string
    unitPrice: string
    quantity: number
    lineTotal: string
  }[]
}

export type LoyaltyTransactionRow = {
  id: string
  type: string
  pointsChange: number
  description: string
  orderId: string | null
  createdAt: string
}

export type LoyaltyDashboard = {
  balance: number
  howPointsAreEarned: string
  recentTransactions: LoyaltyTransactionRow[]
}

export async function fetchMyOrders() {
  return apiFetch<{ orders: AccountOrderSummary[] }>('/api/account/orders')
}

export async function fetchMyAccount() {
  return apiFetch<{ user: AuthUser }>('/api/account/me')
}

export async function fetchMyOrder(orderId: string) {
  return apiFetch<{ order: AccountOrderDetail }>(`/api/account/orders/${orderId}`)
}

export async function fetchMyLoyalty() {
  return apiFetch<LoyaltyDashboard>('/api/account/loyalty')
}
