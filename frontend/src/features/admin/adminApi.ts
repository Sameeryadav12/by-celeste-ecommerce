import { apiFetch } from '../../lib/api'

export type AdminSummary = {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  paidOrders: number
  upcomingEvents: number
}

export type AdminOrderListRow = {
  id: string
  createdAt: string
  status: string
  paymentStatus: string
  totalAmount: string
  customer: { email: string; firstName: string; lastName: string }
}

export type AdminOrderDetail = {
  id: string
  createdAt: string
  updatedAt: string
  status: string
  paymentStatus: string
  subtotalAmount: string
  shippingAmount: string
  totalAmount: string
  customer: { email: string; firstName: string; lastName: string; phone: string }
  shipping: {
    addressLine1: string
    addressLine2: string | null
    suburb: string
    state: string
    postcode: string
    country: string
  }
  notes: string | null
  squarePaymentLinkId?: string | null
  squareOrderId?: string | null
  payment?: {
    provider: string
    providerReference: string | null
    status: string
    createdAt: string
  } | null
  items: Array<{
    id: string
    productId: string
    name: string
    slug: string
    unitPrice: string
    quantity: number
    lineTotal: string
  }>
}

export async function fetchAdminSummary() {
  return apiFetch<AdminSummary>('/api/admin/summary', { method: 'GET' })
}

export type AdminListProductsResponse = {
  products: Array<{
    id: string
    name: string
    slug: string
    shortDescription: string
    description: string
    howToUse: string
    price: string
    wholesalePrice: string | null
    compareAtPrice: string | null
    imageUrl: string
    isFeatured: boolean
    isActive: boolean
    stockQuantity: number
    categories?: Array<{ id: string; name: string; slug: string; description: string | null; isActive: boolean }>
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function listAdminProducts(opts?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  activeOnly?: boolean
}) {
  const params = new URLSearchParams()
  if (opts?.page != null) params.set('page', String(opts.page))
  if (opts?.limit != null) params.set('limit', String(opts.limit))
  if (opts?.search) params.set('search', opts.search)
  if (opts?.category) params.set('category', opts.category)
  if (opts?.sort) params.set('sort', opts.sort)
  if (opts?.activeOnly != null) params.set('activeOnly', opts.activeOnly ? 'true' : 'false')
  const suffix = params.toString() ? `?${params.toString()}` : ''

  return apiFetch<AdminListProductsResponse>(`/api/admin/products${suffix}`, { method: 'GET' })
}

export type AdminProductDetail = {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  howToUse: string
  price: string
  wholesalePrice: string | null
  compareAtPrice: string | null
  imageUrl: string
  isFeatured: boolean
  isActive: boolean
  stockQuantity: number
  categories: Array<{ id: string; name: string; slug: string; description: string | null; isActive: boolean }>
  ingredients: Array<{ id: string; name: string; slug: string; description: string; benefits: string | null }>
}

export async function getAdminProduct(id: string) {
  return apiFetch<{ product: AdminProductDetail }>(`/api/admin/products/${id}`, { method: 'GET' }).then(
    (r) => r.product,
  )
}

export async function createAdminProduct(body: unknown) {
  return apiFetch<{ product: AdminProductDetail }>('/api/admin/products', { method: 'POST', body }).then(
    (r) => r.product,
  )
}

export async function updateAdminProduct(id: string, body: unknown) {
  return apiFetch<{ product: AdminProductDetail }>(`/api/admin/products/${id}`, { method: 'PUT', body }).then(
    (r) => r.product,
  )
}

export async function deactivateAdminProduct(id: string) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
}

export type AdminEventItem = {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  locationName: string
  addressLine1: string | null
  addressLine2: string | null
  suburb: string
  state: string
  postcode: string
  country: string
  startDateTime: string
  endDateTime: string
  imageUrl: string | null
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export async function listAdminEvents(opts?: { includeUnpublished?: boolean; limit?: number }) {
  const params = new URLSearchParams()
  if (opts?.includeUnpublished != null)
    params.set('includeUnpublished', opts.includeUnpublished ? 'true' : 'false')
  if (opts?.limit != null) params.set('limit', String(opts.limit))
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<{ events: AdminEventItem[]; pagination: unknown }>(`/api/admin/events${suffix}`)
}

export async function createAdminEvent(body: unknown) {
  return apiFetch<{ event: AdminEventItem }>('/api/admin/events', { method: 'POST', body }).then((r) => r.event)
}

export async function updateAdminEvent(id: string, body: unknown) {
  return apiFetch<{ event: AdminEventItem }>(`/api/admin/events/${id}`, { method: 'PUT', body }).then(
    (r) => r.event,
  )
}

export async function unpublishAdminEvent(id: string) {
  return apiFetch<{ event: AdminEventItem }>(`/api/admin/events/${id}`, { method: 'DELETE' }).then(
    (r) => r.event,
  )
}

export async function listAllCategories(includeInactive: boolean) {
  const params = includeInactive ? '?activeOnly=false' : ''
  return apiFetch<{ categories: Array<{ id: string; name: string; slug: string; description: string | null; isActive: boolean }> }>(
    `/api/categories${params}`,
    { method: 'GET' },
  ).then((r) => r.categories)
}

export async function listIngredients() {
  const data = await apiFetch<{ ingredients: Array<{ id: string; name: string; slug: string; description: string; benefits: string | null }> }>(
    '/api/ingredients',
  )
  return data.ingredients
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export async function listAdminCategories(includeInactive: boolean) {
  const suffix = includeInactive ? '?activeOnly=false' : ''
  const data = await apiFetch<{ categories: AdminCategory[] }>(`/api/categories${suffix}`, { method: 'GET' })
  return data.categories
}

export async function createAdminCategory(body: unknown) {
  return apiFetch<{ category: AdminCategory }>('/api/admin/categories', { method: 'POST', body }).then((r) => r.category)
}

export async function updateAdminCategory(id: string, body: unknown) {
  return apiFetch<{ category: AdminCategory }>(`/api/admin/categories/${id}`, { method: 'PUT', body }).then((r) => r.category)
}

export async function deactivateAdminCategory(id: string) {
  return apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
}

export type AdminIngredient = {
  id: string
  name: string
  slug: string
  description: string
  benefits: string | null
}

export async function createAdminIngredient(body: unknown) {
  return apiFetch<{ ingredient: AdminIngredient }>('/api/admin/ingredients', { method: 'POST', body }).then((r) => r.ingredient)
}

export async function updateAdminIngredient(id: string, body: unknown) {
  return apiFetch<{ ingredient: AdminIngredient }>(`/api/admin/ingredients/${id}`, { method: 'PUT', body }).then((r) => r.ingredient)
}

export async function deleteAdminIngredient(id: string) {
  return apiFetch(`/api/admin/ingredients/${id}`, { method: 'DELETE' })
}

export async function listAdminOrders(opts?: {
  limit?: number
  search?: string
  status?: string
  paymentStatus?: string
}) {
  const params = new URLSearchParams()
  if (opts?.limit) params.set('limit', String(opts.limit))
  if (opts?.search) params.set('search', opts.search)
  if (opts?.status) params.set('status', opts.status)
  if (opts?.paymentStatus) params.set('paymentStatus', opts.paymentStatus)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<{ orders: AdminOrderListRow[] }>(`/api/admin/orders${suffix}`).then((r) => r.orders)
}

export async function getAdminOrder(orderId: string) {
  return apiFetch<{ order: AdminOrderDetail }>(`/api/admin/orders/${orderId}`).then((r) => r.order)
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  return apiFetch<{ order: { id: string; status: string; paymentStatus: string; updatedAt: string } }>(
    `/api/admin/orders/${orderId}/status`,
    { method: 'PUT', body: { status } },
  ).then((r) => r.order)
}

export type AdminTestimonial = {
  id: string
  customerName: string
  text: string
  isVisible: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export async function listAdminTestimonials() {
  return apiFetch<{ testimonials: AdminTestimonial[] }>('/api/admin/testimonials').then((r) => r.testimonials)
}

export async function createAdminTestimonial(body: {
  customerName: string
  text: string
  isVisible?: boolean
  isFeatured?: boolean
}) {
  return apiFetch<{ testimonial: AdminTestimonial }>('/api/admin/testimonials', {
    method: 'POST',
    body,
  }).then((r) => r.testimonial)
}

export async function updateAdminTestimonial(
  id: string,
  body: Partial<{ customerName: string; text: string; isVisible: boolean; isFeatured: boolean }>,
) {
  return apiFetch<{ testimonial: AdminTestimonial }>(`/api/admin/testimonials/${id}`, {
    method: 'PUT',
    body,
  }).then((r) => r.testimonial)
}

export async function deleteAdminTestimonial(id: string) {
  return apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
}

export type AdminMarketingContent = {
  homepageHeroHeading: string
  homepageSubtext: string
  homepageTagline: string
  featuredProductsHeading: string
  ingredientsSectionHeading: string
  ingredientsSectionText: string
  testimonialsSectionHeading: string
  testimonialsSectionSubheading: string
  facebookUrl: string
  footerTrustWording: string
  updatedAt: string
}

export async function getAdminMarketingContent() {
  return apiFetch<{ marketing: AdminMarketingContent }>('/api/admin/content/marketing').then(
    (r) => r.marketing,
  )
}

export async function updateAdminMarketingContent(body: Partial<AdminMarketingContent>) {
  return apiFetch<{ marketing: AdminMarketingContent }>('/api/admin/content/marketing', {
    method: 'PUT',
    body,
  }).then((r) => r.marketing)
}

export type AdminThemeSettings = {
  primaryBrandColor: string
  secondaryBrandColor: string
  buttonStyleEmphasis: 'solid' | 'soft'
  homepageHeroEmphasis: boolean
  trustBadgesVisible: boolean
  trustBadgeHeading: string
  headerLogoPath: string
  footerLogoPath: string
  trustBadgeIconPath: string
  updatedAt: string
}

export type AdminBusinessSettings = {
  businessDisplayName: string
  footerLocationWording: string
  footerSupportText: string
  facebookUrl: string
  trustStripWording: string
  shippingMethodLabel: string
  shippingAmountDisplay: string
  shippingCarrierWording: string
  shippingExplanatoryNote: string
  australiaPostCarrierWording: string
  updatedAt: string
}

export async function getAdminThemeSettings() {
  return apiFetch<{ theme: AdminThemeSettings }>('/api/admin/content/theme').then((r) => r.theme)
}

export async function updateAdminThemeSettings(body: Partial<AdminThemeSettings>) {
  return apiFetch<{ theme: AdminThemeSettings }>('/api/admin/content/theme', {
    method: 'PUT',
    body,
  }).then((r) => r.theme)
}

export async function getAdminBusinessSettings() {
  return apiFetch<{ business: AdminBusinessSettings }>('/api/admin/content/business').then(
    (r) => r.business,
  )
}

export async function updateAdminBusinessSettings(body: Partial<AdminBusinessSettings>) {
  return apiFetch<{ business: AdminBusinessSettings }>('/api/admin/content/business', {
    method: 'PUT',
    body,
  }).then((r) => r.business)
}

export type AdminWholesaleListRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  businessName: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  wholesaleApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
  createdAt: string
  approvedAt: string | null
}

export type AdminWholesaleDetail = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  businessName: string | null
  abn: string | null
  wholesaleNotes: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  wholesaleApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  compliance: {
    productOwnershipModeled: boolean
    note: string
  }
}

export async function listAdminWholesalers(opts?: {
  limit?: number
  search?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
}) {
  const params = new URLSearchParams()
  if (opts?.limit) params.set('limit', String(opts.limit))
  if (opts?.search) params.set('search', opts.search)
  if (opts?.status) params.set('status', opts.status)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<{ wholesalers: AdminWholesaleListRow[] }>(`/api/admin/wholesale${suffix}`).then(
    (r) => r.wholesalers,
  )
}

export async function getAdminWholesaler(id: string) {
  return apiFetch<{ wholesaler: AdminWholesaleDetail }>(`/api/admin/wholesale/${id}`).then(
    (r) => r.wholesaler,
  )
}

export async function moderateAdminWholesaler(
  id: string,
  action: 'APPROVE' | 'REJECT' | 'SUSPEND',
) {
  return apiFetch<{
    wholesaler: {
      id: string
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
      wholesaleApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
      isActive: boolean
      approvedAt: string | null
      updatedAt: string
    }
  }>(`/api/admin/wholesale/${id}/moderation`, {
    method: 'PUT',
    body: { action },
  }).then((r) => r.wholesaler)
}

