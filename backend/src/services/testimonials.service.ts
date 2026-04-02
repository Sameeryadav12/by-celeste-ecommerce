import { randomUUID } from 'crypto'
import { ApiError } from '../utils/apiError'
import { readContentDb, writeContentDb, type TestimonialRecord } from './contentStore'

export async function listPublicTestimonials() {
  const db = await readContentDb()
  return db.testimonials.filter((t) => t.isVisible)
}

export async function listAdminTestimonials() {
  const db = await readContentDb()
  return db.testimonials
}

export async function createTestimonial(input: { customerName: string; text: string; isVisible?: boolean; isFeatured?: boolean }) {
  const db = await readContentDb()
  const now = new Date().toISOString()
  const next: TestimonialRecord = {
    id: randomUUID(),
    customerName: input.customerName.trim(),
    text: input.text.trim(),
    isVisible: input.isVisible ?? true,
    isFeatured: input.isFeatured ?? false,
    createdAt: now,
    updatedAt: now,
  }
  db.testimonials.unshift(next)
  await writeContentDb(db)
  return next
}

export async function updateTestimonial(
  id: string,
  input: Partial<{ customerName: string; text: string; isVisible: boolean; isFeatured: boolean }>,
) {
  const db = await readContentDb()
  const idx = db.testimonials.findIndex((t) => t.id === id)
  if (idx === -1) {
    throw new ApiError({
      statusCode: 404,
      code: 'TESTIMONIAL_NOT_FOUND',
      message: 'Testimonial not found.',
    })
  }

  const prev = db.testimonials[idx]
  const next: TestimonialRecord = {
    ...prev,
    customerName: input.customerName != null ? input.customerName.trim() : prev.customerName,
    text: input.text != null ? input.text.trim() : prev.text,
    isVisible: input.isVisible ?? prev.isVisible,
    isFeatured: input.isFeatured ?? prev.isFeatured,
    updatedAt: new Date().toISOString(),
  }
  db.testimonials[idx] = next
  await writeContentDb(db)
  return next
}

export async function deleteTestimonial(id: string) {
  const db = await readContentDb()
  const exists = db.testimonials.some((t) => t.id === id)
  if (!exists) {
    throw new ApiError({
      statusCode: 404,
      code: 'TESTIMONIAL_NOT_FOUND',
      message: 'Testimonial not found.',
    })
  }
  db.testimonials = db.testimonials.filter((t) => t.id !== id)
  await writeContentDb(db)
}
