export type EventItem = {
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

export type EventsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}
