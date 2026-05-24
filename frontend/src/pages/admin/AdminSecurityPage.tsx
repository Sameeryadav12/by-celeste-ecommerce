import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PasswordInput } from '../../components/ui/PasswordInput'
import {
  disableAdminTotp,
  fetchAdminTotpStatus,
  startAdminTotpSetup,
  verifyAdminTotpSetup,
  type AdminTotpStatus,
} from '../../features/admin/adminApi'

export function AdminSecurityPage() {
  const { refreshUser, user } = useAuth()
  const [status, setStatus] = useState<AdminTotpStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null)
  const [setupCode, setSetupCode] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)

  const [disablePassword, setDisablePassword] = useState('')
  const [disableBusy, setDisableBusy] = useState(false)

  const loadStatus = useCallback(async () => {
    setError(null)
    const s = await fetchAdminTotpStatus()
    setStatus(s)
    return s
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadStatus()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load security settings.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadStatus])

  async function handleStartSetup() {
    setError(null)
    setMessage(null)
    setSetupBusy(true)
    setSetupCode('')
    try {
      const data = await startAdminTotpSetup()
      setQrDataUrl(data.qrDataUrl)
      setOtpauthUrl(data.otpauthUrl)
      await loadStatus()
      if (data.resumedPending) {
        setMessage('Showing your existing setup QR. Enter the code from your app to finish enabling.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start authenticator setup.')
    } finally {
      setSetupBusy(false)
    }
  }

  async function handleVerifySetup(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const normalized = setupCode.trim().replace(/\s+/g, '')
    if (!/^\d{6}$/.test(normalized)) {
      setError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setSetupBusy(true)
    try {
      await verifyAdminTotpSetup(normalized)
      setQrDataUrl(null)
      setOtpauthUrl(null)
      setSetupCode('')
      await loadStatus()
      await refreshUser()
      setMessage('Two-factor authentication is now enabled. Your next admin sign-in will ask for a code.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work. Try a new code.')
    } finally {
      setSetupBusy(false)
    }
  }

  async function handleDisable(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!disablePassword) {
      setError('Enter your account password to turn off two-factor authentication.')
      return
    }
    setDisableBusy(true)
    try {
      await disableAdminTotp(disablePassword)
      setDisablePassword('')
      await loadStatus()
      await refreshUser()
      setQrDataUrl(null)
      setOtpauthUrl(null)
      setSetupCode('')
      setMessage('Two-factor authentication has been turned off for this admin account.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not disable two-factor authentication.')
    } finally {
      setDisableBusy(false)
    }
  }

  if (loading || !status) {
    return <p className="text-sm text-slate-500">Loading security settings…</p>
  }

  const totpEnabled = status.totpEnabled === true || user?.totpEnabled === true
  const enrollmentPending = status.totpEnrollmentPending && !totpEnabled

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Security</h1>
        <p className="mt-1 text-sm text-slate-500">
          Optional authenticator-based two-factor authentication (TOTP) for administrator accounts.
          No SMS. Retail customers are never required to use this.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Authenticator app (TOTP)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use Google Authenticator, Microsoft Authenticator, or any app that supports standard TOTP
          codes. This strengthens production admin access; wholesale accounts could adopt the same
          pattern later without affecting shoppers.
        </p>

        {totpEnabled ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Two-factor authentication is <strong>on</strong> for this account. You will enter a
              6-digit code after your password when signing in to the admin portal.
            </p>
            <form className="space-y-3" onSubmit={handleDisable}>
              <p className="text-sm font-medium text-slate-800">Turn off 2FA</p>
              <p className="text-xs text-slate-500">
                Confirm with your account password. You can set up authenticator again at any time.
              </p>
              <div className="max-w-sm">
                <label htmlFor="disable-totp-pw" className="sr-only">
                  Password
                </label>
                <PasswordInput
                  id="disable-totp-pw"
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={setDisablePassword}
                />
              </div>
              <Button type="submit" variant="ghost" disabled={disableBusy}>
                {disableBusy ? 'Disabling…' : 'Disable two-factor authentication'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {enrollmentPending && !qrDataUrl ? (
              <p className="text-sm text-amber-800">
                A setup was started earlier but not finished. Open the QR again and enter a fresh
                code to complete enrollment, or finish in the same session where you began.
              </p>
            ) : null}

            {!qrDataUrl ? (
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleStartSetup} disabled={setupBusy}>
                  {setupBusy
                    ? 'Preparing…'
                    : enrollmentPending
                      ? 'Show QR code again'
                      : 'Set up authenticator'}
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifySetup}>
                <p className="text-sm text-slate-700">
                  Scan this QR code in your authenticator app (issuer <strong>By Celeste</strong>),
                  then enter the 6-digit code to confirm.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                    <img src={qrDataUrl} width={220} height={220} alt="QR code for authenticator setup" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Manual entry (if you cannot scan)
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-600">{otpauthUrl}</p>
                    </div>
                    <div>
                      <label htmlFor="totp-setup-code" className="text-sm font-medium text-slate-800">
                        6-digit code
                      </label>
                      <input
                        id="totp-setup-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        placeholder="000000"
                        className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm tracking-widest text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        value={setupCode}
                        onChange={(e) =>
                          setSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={setupBusy}>
                        {setupBusy ? 'Verifying…' : 'Enable two-factor authentication'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={setupBusy}
                        onClick={() => {
                          setQrDataUrl(null)
                          setOtpauthUrl(null)
                          setSetupCode('')
                          setError(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
