import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../auth/authApi'
import { PasswordInput } from '../components/ui/PasswordInput'

type Field = 'newPassword' | 'confirmPassword'
type FieldErrors = Partial<Record<Field, string>>

function checkPasswordRules(value: string): { ok: boolean; error?: string } {
  if (value.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }
  if (!/[a-z]/.test(value)) return { ok: false, error: 'Password must contain at least 1 lowercase letter.' }
  if (!/[A-Z]/.test(value)) return { ok: false, error: 'Password must contain at least 1 uppercase letter.' }
  if (!/\d/.test(value)) return { ok: false, error: 'Password must contain at least 1 digit.' }
  if (!/[^A-Za-z0-9]/.test(value))
    return { ok: false, error: 'Password must contain at least 1 special character.' }
  return { ok: true }
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  if (!token) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Reset password
          </h1>
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            This reset link is missing its token. Please request a new password reset email.
          </p>
          <p className="mt-4 text-center text-xs text-neutral-600">
            <Link
              to="/forgot-password"
              className="font-medium text-neutral-900 underline-offset-4 hover:underline"
            >
              Request a new link
            </Link>
          </p>
        </div>
      </section>
    )
  }

  function validate(): boolean {
    const errors: FieldErrors = {}
    const rule = checkPasswordRules(newPassword)
    if (!rule.ok) errors.newPassword = rule.error
    if (confirmPassword !== newPassword)
      errors.confirmPassword = 'Passwords do not match.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    try {
      const result = await resetPassword({ token, newPassword })
      setSuccess(
        result.message ||
          'Your password has been updated. You can now log in with your new password.',
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not reset your password. The link may be invalid or expired.'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Reset password</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Choose a new password for your By Celeste account. Use at least 8 characters with a mix
          of upper and lower case, a digit and a special character.
        </p>

        {success ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              {success}
            </div>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-neutral-800">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
              />
              {fieldErrors.newPassword ? (
                <p className="text-xs text-red-600">{fieldErrors.newPassword}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-800">
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
              {fieldErrors.confirmPassword ? (
                <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-neutral-600">
          <Link
            to="/login"
            className="font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
