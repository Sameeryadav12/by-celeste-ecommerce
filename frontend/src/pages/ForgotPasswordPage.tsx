import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../auth/authApi'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldError(null)

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setFieldError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const result = await forgotPassword({ email: trimmed })
      setConfirmMessage(
        result.message ||
          'If an account exists for this email, a reset link will be sent.',
      )
    } catch {
      // Never reveal whether the email exists — show the same safe message even on transient errors.
      setConfirmMessage(
        'If an account exists for this email, a reset link will be sent.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Forgot password</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Enter the email address associated with your By Celeste account. We will send a secure
          link to reset your password.
        </p>

        {confirmMessage ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            {confirmMessage}
          </div>
        ) : null}

        {!confirmMessage ? (
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
              {fieldError ? <p className="text-xs text-red-600">{fieldError}</p> : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        ) : null}

        <p className="mt-4 text-center text-xs text-neutral-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
