import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type FieldErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const errors: FieldErrors = {}
    const nameRegex = /^[A-Za-z ]+$/

    const trimmedFirst = firstName.trim()
    if (!trimmedFirst) {
      errors.firstName = 'First name is required.'
    } else if (trimmedFirst.length < 2 || trimmedFirst.length > 50) {
      errors.firstName = 'First name must be between 2 and 50 characters.'
    } else if (!nameRegex.test(trimmedFirst)) {
      errors.firstName = 'First name can only contain letters and spaces.'
    }

    const trimmedLast = lastName.trim()
    if (!trimmedLast) {
      errors.lastName = 'Last name is required.'
    } else if (trimmedLast.length < 2 || trimmedLast.length > 50) {
      errors.lastName = 'Last name must be between 2 and 50 characters.'
    } else if (!nameRegex.test(trimmedLast)) {
      errors.lastName = 'Last name can only contain letters and spaces.'
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    } else {
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters.'
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Password must contain at least 1 lowercase letter.'
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least 1 uppercase letter.'
      } else if (!/\d/.test(password)) {
        errors.password = 'Password must contain at least 1 digit.'
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = 'Password must contain at least 1 special character.'
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords must match exactly.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (isSubmitting) return

    const ok = validate()
    if (!ok) return

    setIsSubmitting(true)
    try {
      await signup({ firstName, lastName, email, password })
      navigate('/account', { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not create your account. Please check your details and try again.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Join By Celeste to keep orders in one place. After you shop while signed in, completed
          purchases can earn loyalty points—visible in your account once payment is confirmed.
        </p>

        {formError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-medium text-neutral-800">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
              {fieldErrors.firstName ? (
                <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-medium text-neutral-800">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
              {fieldErrors.lastName ? (
                <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-neutral-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-neutral-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                At least 8 characters, with 1 lowercase, 1 uppercase, 1 number, and 1 symbol.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-800">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {fieldErrors.confirmPassword ? (
              <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

