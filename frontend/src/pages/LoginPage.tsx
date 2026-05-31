import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { defaultHomePathForUser, resolvePostLoginPath } from '../auth/postLoginRedirect'
import { PasswordInput } from '../components/ui/PasswordInput'

type FieldErrors = {
  email?: string
  password?: string
}

type LoginStep = 'credentials' | 'totp'

export function LoginPage() {
  const { status, user, login, completeLoginWithTotp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const adminReturnPath =
    typeof location.state?.from === 'string' && location.state.from.startsWith('/admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<LoginStep>('credentials')
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')

  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    navigate(defaultHomePathForUser(user), { replace: true })
  }, [status, user, navigate])

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-neutral-600" aria-busy="true">
          Checking your session…
        </p>
      </section>
    )
  }

  if (status === 'authenticated' && user) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-neutral-600" aria-busy="true">
          Redirecting…
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
      const result = await login({ email, password })
      if ('requiresTwoFactor' in result) {
        setTwoFactorToken(result.twoFactorToken)
        setStep('totp')
        setTotpCode('')
        return
      }
      const redirectTo = resolvePostLoginPath(result, location.state?.from)
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

  async function handleTotpSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!twoFactorToken) {
      setFormError('Your sign-in session expired. Please sign in again with email and password.')
      return
    }
    const normalized = totpCode.trim().replace(/\s+/g, '')
    if (!/^\d{6}$/.test(normalized)) {
      setFormError('Enter the 6-digit code from your authenticator app.')
      return
    }
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const signedIn = await completeLoginWithTotp({ twoFactorToken, code: normalized })
      const redirectTo = resolvePostLoginPath(signedIn, location.state?.from)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'That code did not work. Try again or sign in from the start.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function goBackToCredentials() {
    setStep('credentials')
    setTwoFactorToken(null)
    setTotpCode('')
    setFormError(null)
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {step === 'totp' ? 'Authenticator code' : 'Sign in'}
        </h1>
        {adminReturnPath ? (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">Admin dashboard</p>
            <p className="mt-1 leading-relaxed">
              This area is protected. Sign in with an <strong>administrator</strong> account. After a
              successful sign-in you will be returned to the admin portal.
            </p>
          </div>
        ) : null}
        {step === 'totp' ? (
          <p className="mt-2 text-sm text-neutral-600">
            This account uses an authenticator app for extra security. Open Google Authenticator (or
            your preferred TOTP app) and enter the 6-digit code for <strong>By Celeste</strong>.
          </p>
        ) : !adminReturnPath ? (
          <p className="mt-2 text-sm text-neutral-600">
            Welcome back. Enter your details to continue to By Celeste. When you shop signed in,
            completed orders can earn loyalty points—see your account after purchase.
          </p>
        ) : null}

        {formError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        {step === 'credentials' ? (
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
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              ) : null}
            </div>

            <div className="-mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleTotpSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="totp" className="text-sm font-medium text-neutral-800">
                6-digit code
              </label>
              <input
                id="totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="000000"
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm tracking-widest text-neutral-900 shadow-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="text-xs text-neutral-500">
                Codes refresh every 30 seconds. If a code fails, wait for the next one.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSubmitting ? 'Verifying…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={goBackToCredentials}
              className="w-full text-center text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
            >
              Back to email and password
            </button>
          </form>
        )}

        {step === 'credentials' ? (
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
        ) : null}
      </div>
    </section>
  )
}

