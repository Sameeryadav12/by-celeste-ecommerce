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
    compareAtPrice: string | null
    imageUrl: string
    isFeatured: boolean
    isActive: boolean
    stockQuantity: number
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
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  activeOnly?: boolean
}) {
  const params = new URLSearchParams()
  if (opts?.page != null) params.set('page', String(opts.page))
  if (opts?.limit != null) params.set('limit', String(opts.limit))
  if (opts?.search) params.set('search', opts.search)
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

export async function listAdminOrders(limit?: number) {
  const suffix = limit ? `?limit=${limit}` : ''
  return apiFetch<{ orders: AdminOrderListRow[] }>(`/api/admin/orders${suffix}`).then((r) => r.orders)
}

export async function getAdminOrder(orderId: string) {
  return apiFetch<{ order: AdminOrderDetail }>(`/api/admin/orders/${orderId}`).then((r) => r.order)
}

