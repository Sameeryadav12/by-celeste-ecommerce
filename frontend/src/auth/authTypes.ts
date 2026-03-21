export type Role = 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'

export type WholesaleApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive: boolean
  /** Cached loyalty balance; refreshed from /api/auth/me and account loyalty endpoint. */
  loyaltyPointsBalance?: number
  wholesaleApprovalStatus: WholesaleApprovalStatus
  businessName: string | null
  abn: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

