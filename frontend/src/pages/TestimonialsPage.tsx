import { Seo } from '../components/seo/Seo'
import { useEffect, useState } from 'react'
import { getPublicTestimonials, type PublicTestimonial } from '../features/content/contentApi'
import { BrandIcon } from '../components/icons/BrandIcon'
import { Reveal } from '../components/animation/Reveal'

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getPublicTestimonials()
      .then((data) => {
        if (!cancelled) setTestimonials(data)
      })
      .catch(() => {
        if (!cancelled) setTestimonials([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Seo
        title="Testimonials | By Celeste"
        description="Read what By Celeste customers say about their skincare favourites."
      />
      <section className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Testimonials
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Real feedback from customers who use By Celeste in their everyday routines.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading testimonials...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-sm text-neutral-500">No testimonials are available right now.</p>
        ) : (
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="transform-gpu rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
              >
                <BrandIcon name="quote" className="h-4 w-4 opacity-25" alt="" />
                <p className="mt-3 text-sm leading-7 text-neutral-700">{item.text}</p>
                <div className="mt-4 border-t border-neutral-200/70 pt-3 text-sm font-semibold text-neutral-900">
                  {item.customerName}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
        )}
      </section>
    </>
  )
}
