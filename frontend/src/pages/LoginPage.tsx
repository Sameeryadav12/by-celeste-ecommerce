import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type FieldErrors = {
  email?: string
  password?: string
}

export function LoginPage() {
  const { status, user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user && status === 'authenticated') {
    navigate('/account', { replace: true })
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-neutral-600" aria-busy="true">
          Checking your session…
        </p>
      </section>
    )
  }

  function validate() {
    const errors: FieldErrors = {}
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
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
      await login({ email, password })
      const redirectTo = location.state?.from || '/account'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not sign you in. Please check your details and try again.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Welcome back. Enter your details to continue to By Celeste. When you shop signed in,
          completed orders can earn loyalty points—see your account after purchase.
        </p>

        {formError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-600">
          New to By Celeste?{' '}
          <Link
            to="/signup"
            className="font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

