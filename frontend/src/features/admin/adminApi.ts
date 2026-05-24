import { apiFetch, buildApiUrl, getApiBaseUrl } from '../../lib/api'
import { formatOrderNumber } from '../../lib/orderNumber'

export type AdminSummary = {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  paidOrders: number
  upcomingEvents: number
  pendingWholesaleApplications: number
  square: {
    connected: boolean
    missingEnv: string[]
  }
  lowStockProducts: Array<{
    id: string
    name: string
    stockQuantity: number
  }>
}

export type AdminOrderListRow = {
  id: string
  orderNumber: number
  orderRef?: string
  createdAt: string
  status: string
  paymentStatus: string
  totalAmount: string
  customer: { email: string; firstName: string; lastName: string }
}

export type AdminOrderDetail = {
  id: string
  orderNumber: number
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

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const data = await apiFetch<Partial<AdminSummary>>('/api/admin/summary', { method: 'GET' })
  return {
    totalProducts: data.totalProducts ?? 0,
    activeProducts: data.activeProducts ?? 0,
    totalOrders: data.totalOrders ?? 0,
    paidOrders: data.paidOrders ?? 0,
    upcomingEvents: data.upcomingEvents ?? 0,
    pendingWholesaleApplications: data.pendingWholesaleApplications ?? 0,
    square: data.square ?? { connected: false, missingEnv: [] },
    lowStockProducts: data.lowStockProducts ?? [],
  }
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

export async function deleteAdminProduct(id: string) {
  return apiFetch<{ message: string; id: string }>(`/api/admin/products/${id}`, { method: 'DELETE' })
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

/** Active ingredients for product forms and public pickers. */
export async function listIngredients() {
  const data = await apiFetch<{ ingredients: AdminIngredient[] }>('/api/ingredients')
  return data.ingredients
}

export async function listAdminIngredients() {
  const data = await apiFetch<{ ingredients: AdminIngredient[] }>('/api/admin/ingredients')
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
  isActive: boolean
}

export async function createAdminIngredient(body: unknown) {
  return apiFetch<{ ingredient: AdminIngredient }>('/api/admin/ingredients', { method: 'POST', body }).then((r) => r.ingredient)
}

export async function updateAdminIngredient(id: string, body: unknown) {
  return apiFetch<{ ingredient: AdminIngredient }>(`/api/admin/ingredients/${id}`, { method: 'PUT', body }).then((r) => r.ingredient)
}

export async function deactivateAdminIngredient(id: string) {
  return apiFetch(`/api/admin/ingredients/${id}`, { method: 'DELETE' })
}

export async function permanentDeleteAdminIngredient(id: string) {
  return apiFetch(`/api/admin/ingredients/${id}/permanent`, { method: 'DELETE' })
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

export type AdminCustomerListRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'
  isActive: boolean
  createdAt: string
  orderCount: number
  loyaltyPointsBalance: number
  wholesaleApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

export type AdminCustomerSpending = {
  paidOrderCount: number
  totalSpentAud: string
  lastPaidOrderAt: string | null
  lastPaidOrderTotal: string | null
}

export const EMPTY_ADMIN_CUSTOMER_SPENDING: AdminCustomerSpending = {
  paidOrderCount: 0,
  totalSpentAud: '0.00',
  lastPaidOrderAt: null,
  lastPaidOrderTotal: null,
}

export function normalizeAdminCustomerDetail(raw: AdminCustomerDetail): AdminCustomerDetail {
  return {
    ...raw,
    adminNotes: raw.adminNotes ?? '',
    orderCount: raw.orderCount ?? 0,
    orders: Array.isArray(raw.orders) ? raw.orders : [],
    spending: raw.spending
      ? {
          paidOrderCount: raw.spending.paidOrderCount ?? 0,
          totalSpentAud: raw.spending.totalSpentAud ?? '0.00',
          lastPaidOrderAt: raw.spending.lastPaidOrderAt ?? null,
          lastPaidOrderTotal: raw.spending.lastPaidOrderTotal ?? null,
        }
      : EMPTY_ADMIN_CUSTOMER_SPENDING,
  }
}

export type AdminCustomerDetail = {
  id: string
  firstName: string
  lastName: string
  email: string
  contactEmail: string | null
  role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  loyaltyPointsBalance: number
  wholesaleApprovalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
  businessName: string | null
  abn: string | null
  approvedAt: string | null
  lastLoginAt: string | null
  adminNotes: string
  orderCount: number
  spending: AdminCustomerSpending
  orders: Array<{
    id: string
    orderNumber: number
    createdAt: string
    status: string
    paymentStatus: string
    totalAmount: string
  }>
}

export async function listAdminCustomers(opts?: {
  limit?: number
  search?: string
  role?: 'CUSTOMER' | 'WHOLESALE' | 'ALL'
  status?: 'active' | 'inactive' | 'all'
}) {
  const params = new URLSearchParams()
  if (opts?.limit) params.set('limit', String(opts.limit))
  if (opts?.search) params.set('search', opts.search)
  if (opts?.role) params.set('role', opts.role)
  if (opts?.status) params.set('status', opts.status)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<{ customers: AdminCustomerListRow[] }>(`/api/admin/customers${suffix}`).then(
    (r) => r.customers,
  )
}

export async function getAdminCustomer(id: string) {
  const payload = await apiFetch<{ customer: AdminCustomerDetail } | AdminCustomerDetail>(
    `/api/admin/customers/${id}`,
  )
  const raw =
    payload && typeof payload === 'object' && 'customer' in payload && payload.customer
      ? payload.customer
      : (payload as AdminCustomerDetail)
  return normalizeAdminCustomerDetail(raw)
}

export async function updateAdminCustomerStatus(id: string, isActive: boolean) {
  return apiFetch<{ customer: AdminCustomerListRow; message: string }>(
    `/api/admin/customers/${id}/status`,
    { method: 'PUT', body: { isActive } },
  ).then((r) => r)
}

export async function updateAdminCustomerNotes(id: string, adminNotes: string) {
  return apiFetch<{ adminNotes: string }>(`/api/admin/customers/${id}/notes`, {
    method: 'PUT',
    body: { adminNotes },
  })
}

function apiErrorMessageFromBody(text: string, fallback: string): string {
  try {
    const data = JSON.parse(text) as { error?: { message?: string } }
    return data.error?.message ?? fallback
  } catch {
    return fallback
  }
}

function looksLikeJsonExport(text: string): boolean {
  const body = text.replace(/^\uFEFF/, '').trimStart()
  return body.startsWith('{') || body.startsWith('[')
}

function csvEscape(value: string | number): string {
  const s = String(value ?? '')
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function csvRow(cells: Array<string | number>): string {
  return cells.map(csvEscape).join(',')
}

function wholesaleExportValue(retail: string, wholesalePrice: string | null): string {
  if (wholesalePrice) return Number(wholesalePrice).toFixed(2)
  const n = Number(retail)
  return Number.isFinite(n) ? (n * 0.5).toFixed(2) : ''
}

function saveCsvFile(csvBody: string, filename: string) {
  const body = csvBody.startsWith('\uFEFF') ? csvBody : `\uFEFF${csvBody}`
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildProductsExportCsv(
  products: AdminListProductsResponse['products'],
): string {
  const lines = [
    csvRow([
      'Product name',
      'Category',
      'Retail price',
      'Wholesale price',
      'Stock',
      'Status',
      'Featured',
    ]),
    ...products.map((p) =>
      csvRow([
        p.name,
        (p.categories ?? []).map((c) => c.name).join('; '),
        p.price,
        wholesaleExportValue(p.price, p.wholesalePrice),
        p.stockQuantity,
        p.isActive ? 'Active' : 'Hidden',
        p.isFeatured ? 'Yes' : 'No',
      ]),
    ),
  ]
  return lines.join('\n')
}

function buildOrdersExportCsv(orders: AdminOrderListRow[]): string {
  const lines = [
    csvRow([
      'Order number',
      'Customer name',
      'Customer email',
      'Created date',
      'Total',
      'Order status',
      'Payment status',
    ]),
    ...orders.map((o) =>
      csvRow([
        formatOrderNumber(o.orderNumber),
        `${o.customer.firstName} ${o.customer.lastName}`.trim(),
        o.customer.email,
        o.createdAt.slice(0, 10),
        o.totalAmount,
        o.status,
        o.paymentStatus,
      ]),
    ),
  ]
  return lines.join('\n')
}

function shouldUseClientCsvFallback(message: string): boolean {
  return (
    message.includes('Route not found') ||
    message.includes('JSON instead of CSV') ||
    message.includes('Could not export')
  )
}

async function downloadAdminCsv(
  path: string,
  fallbackFilename: string,
  errorMessage: string,
) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(apiErrorMessageFromBody(text, errorMessage))
  }

  if (looksLikeJsonExport(text)) {
    throw new Error(
      apiErrorMessageFromBody(
        text,
        'Export returned JSON instead of CSV. Restart the backend and try again.',
      ),
    )
  }

  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = /filename="([^"]+)"/i.exec(disposition)
  const filename = match?.[1] ?? fallbackFilename

  saveCsvFile(text, filename)
}

export async function downloadAdminProductsCsv(opts?: {
  search?: string
  category?: string
  activeOnly?: boolean
}) {
  const params = new URLSearchParams()
  if (opts?.search) params.set('search', opts.search)
  if (opts?.category) params.set('category', opts.category)
  if (opts?.activeOnly === false) params.set('activeOnly', 'false')
  const stamp = new Date().toISOString().slice(0, 10)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const filename = `by-celeste-products-${stamp}.csv`

  try {
    await downloadAdminCsv(
      `/api/admin/exports/products${suffix}`,
      filename,
      'Could not export products.',
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not export products.'
    if (!shouldUseClientCsvFallback(msg)) throw e
    const data = await listAdminProducts({
      page: 1,
      limit: 500,
      search: opts?.search,
      category: opts?.category,
      activeOnly: opts?.activeOnly,
    })
    saveCsvFile(buildProductsExportCsv(data.products), filename)
  }
}

export async function downloadAdminOrdersCsv(opts?: {
  search?: string
  status?: string
  paymentStatus?: string
}) {
  const params = new URLSearchParams()
  if (opts?.search) params.set('search', opts.search)
  if (opts?.status) params.set('status', opts.status)
  if (opts?.paymentStatus) params.set('paymentStatus', opts.paymentStatus)
  const stamp = new Date().toISOString().slice(0, 10)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const filename = `by-celeste-orders-${stamp}.csv`

  try {
    await downloadAdminCsv(
      `/api/admin/exports/orders${suffix}`,
      filename,
      'Could not export orders.',
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not export orders.'
    if (!shouldUseClientCsvFallback(msg)) throw e
    const orders = await listAdminOrders({
      limit: 500,
      search: opts?.search,
      status: opts?.status,
      paymentStatus: opts?.paymentStatus,
    })
    saveCsvFile(buildOrdersExportCsv(orders), filename)
  }
}

export async function downloadAdminCustomersCsv(opts?: {
  search?: string
  role?: 'CUSTOMER' | 'WHOLESALE' | 'ALL'
  status?: 'active' | 'inactive' | 'all'
}) {
  const params = new URLSearchParams()
  if (opts?.search) params.set('search', opts.search)
  if (opts?.role) params.set('role', opts.role)
  if (opts?.status) params.set('status', opts.status)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const stamp = new Date().toISOString().slice(0, 10)

  await downloadAdminCsv(
    `/api/admin/customers/export${suffix}`,
    `by-celeste-customers-${stamp}.csv`,
    'Could not export customers.',
  )
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
  instagramUrl: string
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
  instagramUrl: string
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

/** Admin-only TOTP (authenticator app) — optional second factor at login. */
export type AdminTotpStatus = {
  totpEnabled: boolean
  totpEnrollmentPending: boolean
}

export type AdminTotpSetupStart = {
  qrDataUrl: string
  otpauthUrl: string
  resumedPending: boolean
}

export async function fetchAdminTotpStatus() {
  return apiFetch<AdminTotpStatus>('/api/admin/security/totp/status', { method: 'GET' })
}

export async function startAdminTotpSetup() {
  return apiFetch<AdminTotpSetupStart>('/api/admin/security/totp/setup-start', { method: 'POST' })
}

export async function verifyAdminTotpSetup(code: string) {
  return apiFetch<{ totpEnabled: true }>('/api/admin/security/totp/setup-verify', {
    method: 'POST',
    body: { code },
  })
}

export async function disableAdminTotp(password: string) {
  return apiFetch<{ totpEnabled: false }>('/api/admin/security/totp/disable', {
    method: 'POST',
    body: { password },
  })
}

export async function uploadAdminProductImage(
  file: File,
  options?: { replaceImageUrl?: string },
): Promise<{ imageUrl: string }> {
  const form = new FormData()
  form.append('image', file)
  if (options?.replaceImageUrl?.trim()) {
    form.append('replaceImageUrl', options.replaceImageUrl.trim())
  }

  const res = await fetch(buildApiUrl('/api/admin/uploads/product-image'), {
    method: 'POST',
    body: form,
    credentials: 'include',
  })

  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = (isJson ? await res.json() : null) as
    | { success: boolean; data?: { imageUrl: string }; error?: { message: string } }
    | null

  if (!res.ok || !data || data.success === false) {
    const message =
      data?.error?.message || 'Could not upload the image. Please try again.'
    throw new Error(message)
  }

  return data.data as { imageUrl: string }
}

export async function uploadAdminEventImage(
  file: File,
  options?: { replaceImageUrl?: string },
): Promise<{ imageUrl: string }> {
  const form = new FormData()
  form.append('image', file)
  if (options?.replaceImageUrl?.trim()) {
    form.append('replaceImageUrl', options.replaceImageUrl.trim())
  }

  const res = await fetch(buildApiUrl('/api/admin/uploads/event-image'), {
    method: 'POST',
    body: form,
    credentials: 'include',
  })

  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = (isJson ? await res.json() : null) as
    | { success: boolean; data?: { imageUrl: string }; error?: { message: string } }
    | null

  if (!res.ok || !data || data.success === false) {
    const message =
      data?.error?.message || 'Could not upload the image. Please try again.'
    throw new Error(message)
  }

  return data.data as { imageUrl: string }
}

