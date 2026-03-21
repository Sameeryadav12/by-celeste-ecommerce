import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useCart } from '../features/cart/CartContext'
import { CartSummaryCard } from '../features/cart/components/CartSummaryCard'
import { formatAud } from '../features/cart/money'
import { calculateShipping } from '../features/cart/shippingRules'
import { createCheckoutSession } from '../features/checkout/checkoutApi'
import { Seo } from '../components/seo/Seo'

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const

type CheckoutForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  suburb: string
  state: string
  postcode: string
  country: string
  notes: string
}

type FormErrors = Partial<Record<keyof CheckoutForm, string>>

const initialForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  suburb: '',
  state: '',
  postcode: '',
  country: 'Australia',
  notes: '',
}

export function CheckoutPage() {
  const { items, summary } = useCart()
  const shipping = calculateShipping(summary.subtotal)
  const total = summary.subtotal + shipping

  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <section className="space-y-5">
        <Seo
          title="Checkout | By Celeste"
          description="Checkout on By Celeste. Enter your delivery details and proceed to secure Square hosted checkout."
        />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Checkout</h1>
        <Card>
          <p className="text-sm text-neutral-700">
            Your cart is empty, so checkout is not available yet.
          </p>
          <div className="mt-4">
            <Link to="/shop">
              <Button type="button">Back to Shop</Button>
            </Link>
          </div>
        </Card>
      </section>
    )
  }

  function setField<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    const nameRegex = /^[A-Za-z ]+$/

    const firstName = form.firstName.trim()
    if (!firstName) next.firstName = 'First name is required.'
    else if (firstName.length < 2 || firstName.length > 50)
      next.firstName = 'First name must be between 2 and 50 characters.'
    else if (!nameRegex.test(firstName))
      next.firstName = 'First name can only contain letters and spaces.'

    const lastName = form.lastName.trim()
    if (!lastName) next.lastName = 'Last name is required.'
    else if (lastName.length < 2 || lastName.length > 50)
      next.lastName = 'Last name must be between 2 and 50 characters.'
    else if (!nameRegex.test(lastName))
      next.lastName = 'Last name can only contain letters and spaces.'

    const email = form.email.trim().toLowerCase()
    if (!email) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Please enter a valid email address.'

    const phone = form.phone.trim().replace(/\s+/g, '')
    if (!phone) next.phone = 'Phone is required.'
    else if (!/^(\+?61|0)[2-478]\d{8}$/.test(phone))
      next.phone = 'Please enter a valid Australian phone number.'

    const address1 = form.addressLine1.trim()
    if (!address1) next.addressLine1 = 'Address line 1 is required.'
    else if (address1.length < 5) next.addressLine1 = 'Address line 1 looks too short.'

    const suburb = form.suburb.trim()
    if (!suburb) next.suburb = 'Suburb is required.'
    else if (suburb.length < 2 || suburb.length > 100)
      next.suburb = 'Suburb must be between 2 and 100 characters.'

    if (!form.state) next.state = 'State is required.'
    else if (!AU_STATES.includes(form.state as (typeof AU_STATES)[number]))
      next.state = 'Please select a valid Australian state or territory.'

    const postcode = form.postcode.trim()
    if (!postcode) next.postcode = 'Postcode is required.'
    else if (!/^\d{4}$/.test(postcode)) next.postcode = 'Postcode must be exactly 4 digits.'

    const country = form.country.trim()
    if (!country) next.country = 'Country is required.'

    if (form.notes.trim().length > 1000) next.notes = 'Notes must be 1000 characters or fewer.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const ok = validate()
    if (!ok) {
      setSubmitError(null)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const { checkoutUrl } = await createCheckoutSession({
        cartItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        suburb: form.suburb.trim(),
        state: form.state,
        postcode: form.postcode.trim(),
        country: form.country.trim() || 'Australia',
        notes: form.notes.trim() || undefined,
      })

      window.location.assign(checkoutUrl)
    } catch (e) {
      setSubmitting(false)
      setSubmitError(e instanceof Error ? e.message : 'Checkout could not start. Please try again.')
    }
  }

  return (
    <section className="space-y-6">
      <Seo
        title="Checkout | By Celeste"
        description="Enter delivery details for your By Celeste order and review your total before Square hosted checkout."
      />
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Checkout</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-700">
          Enter your delivery details and review your total. When you continue, you will be taken to
          Square&apos;s secure hosted checkout — we never collect card numbers on this site.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} noValidate>
          <Card>
            <h2 className="text-base font-semibold text-neutral-900">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First name"
                value={form.firstName}
                error={errors.firstName}
                onChange={(value) => setField('firstName', value)}
              />
              <Field
                id="lastName"
                label="Last name"
                value={form.lastName}
                error={errors.lastName}
                onChange={(value) => setField('lastName', value)}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(value) => setField('email', value)}
              />
              <Field
                id="phone"
                label="Phone"
                value={form.phone}
                error={errors.phone}
                onChange={(value) => setField('phone', value)}
              />
              <Field
                id="addressLine1"
                label="Address line 1"
                value={form.addressLine1}
                error={errors.addressLine1}
                onChange={(value) => setField('addressLine1', value)}
              />
              <Field
                id="addressLine2"
                label="Address line 2 (optional)"
                value={form.addressLine2}
                error={errors.addressLine2}
                onChange={(value) => setField('addressLine2', value)}
              />
              <Field
                id="suburb"
                label="Suburb"
                value={form.suburb}
                error={errors.suburb}
                onChange={(value) => setField('suburb', value)}
              />

              <div className="space-y-1.5">
                <label htmlFor="state" className="text-sm font-medium text-neutral-800">
                  State
                </label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(event) => setField('state', event.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="">Select state</option>
                  {AU_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state ? <p className="text-xs text-red-600">{errors.state}</p> : null}
              </div>

              <Field
                id="postcode"
                label="Postcode"
                value={form.postcode}
                error={errors.postcode}
                onChange={(value) => setField('postcode', value)}
              />
              <Field
                id="country"
                label="Country"
                value={form.country}
                error={errors.country}
                onChange={(value) => setField('country', value)}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              <label htmlFor="notes" className="text-sm font-medium text-neutral-800">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
              {errors.notes ? <p className="text-xs text-red-600">{errors.notes}</p> : null}
            </div>

            {submitError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <div className="mt-5">
              <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? 'Starting secure checkout…' : 'Continue to Secure Payment'}
              </Button>
            </div>
          </Card>
        </form>

        <div className="space-y-3">
          <Card>
            <h2 className="text-base font-semibold text-neutral-900">Items in this order</h2>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {formatAud(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <CartSummaryCard
            subtotal={summary.subtotal}
            shipping={shipping}
            total={total}
            showCta={false}
          />
          <p className="text-xs leading-5 text-neutral-500">
            Subtotal, shipping, and total are recalculated on the server when you pay. If anything
            changed (price or stock), you will see a clear message before leaving this site.
          </p>
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'email'
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

