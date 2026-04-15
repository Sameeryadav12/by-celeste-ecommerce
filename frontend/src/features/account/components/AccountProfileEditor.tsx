import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import {
  WS_ACCOUNT_CARD,
  WS_ACCT_PRIMARY,
  WS_ACCT_SECONDARY,
} from '../../../pages/wholesale/wholesaleUi'
import { patchMyAccount, patchMyPassword } from '../accountApi'

type Variant = 'customer' | 'wholesale'

type ProfileDraft = {
  firstName: string
  lastName: string
  email: string
  contactEmail: string
  businessName: string
  abn: string
}

const emptyDraft: ProfileDraft = {
  firstName: '',
  lastName: '',
  email: '',
  contactEmail: '',
  businessName: '',
  abn: '',
}

function userToDraft(u: NonNullable<ReturnType<typeof useAuth>['user']>): ProfileDraft {
  return {
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    email: u.email ?? '',
    contactEmail: u.contactEmail ?? '',
    businessName: u.businessName ?? '',
    abn: u.abn ?? '',
  }
}

function norm(s: string) {
  return s.trim()
}

function draftsEqual(a: ProfileDraft, b: ProfileDraft) {
  return (
    norm(a.firstName) === norm(b.firstName) &&
    norm(a.lastName) === norm(b.lastName) &&
    norm(a.email).toLowerCase() === norm(b.email).toLowerCase() &&
    norm(a.contactEmail) === norm(b.contactEmail) &&
    norm(a.businessName) === norm(b.businessName) &&
    norm(a.abn) === norm(b.abn)
  )
}

function ViewRow({ label, value }: { label: string; value: string }) {
  const display = value.trim() ? value : 'Not provided'
  const muted = !value.trim()
  return (
    <div className="flex items-baseline justify-between gap-8 border-b border-neutral-100 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="w-[38%] shrink-0 text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-400">
        {label}
      </span>
      <span
        className={`min-w-0 flex-1 break-words text-right text-[13px] leading-snug ${muted ? 'font-medium italic text-neutral-400' : 'font-semibold tracking-tight text-neutral-950'}`}
      >
        {display}
      </span>
    </div>
  )
}

type AccountProfileEditorProps = {
  variant: Variant
  className?: string
  /** Runs after profile save (e.g. refetch server copy). */
  onProfileSaved?: () => void | Promise<void>
  /** Account portal: view-first cards, collapsed password (customer + wholesale). */
  layout?: 'standard' | 'portal'
}

export function AccountProfileEditor({
  variant,
  className = '',
  onProfileSaved,
  layout = 'standard',
}: AccountProfileEditorProps) {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [passwordExpanded, setPasswordExpanded] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft)
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) setDraft(userToDraft(user))
  }, [user])

  const cancel = useCallback(() => {
    if (user) setDraft(userToDraft(user))
    setEditing(false)
    setError(null)
    setSuccess(null)
  }, [user])

  const cancelPasswordPanel = useCallback(() => {
    setPasswordExpanded(false)
    setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPwError(null)
    setPwSuccess(null)
  }, [])

  const baseline = user ? userToDraft(user) : emptyDraft
  const hasProfileChanges = user ? !draftsEqual(draft, baseline) : false
  const usePortalLayout = layout === 'portal'

  const wholesaleInputClass =
    'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-neutral-300 focus:ring-1 focus:ring-neutral-900/10 disabled:bg-neutral-50'
  const wholesaleLabelClass =
    'block text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400'
  const wsSectionRule = 'border-b border-neutral-100 pb-3'
  const wsSectionTitle = 'text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400'

  const saveProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const body =
        variant === 'wholesale'
          ? {
              firstName: draft.firstName.trim(),
              lastName: draft.lastName.trim(),
              email: draft.email.trim().toLowerCase(),
              contactEmail: draft.contactEmail.trim(),
              businessName: draft.businessName.trim(),
              abn: draft.abn.trim(),
            }
          : {
              firstName: draft.firstName.trim(),
              lastName: draft.lastName.trim(),
              email: draft.email.trim().toLowerCase(),
              contactEmail: draft.contactEmail.trim(),
            }
      await patchMyAccount(body)
      await refreshUser()
      await onProfileSaved?.()
      setSuccess('Profile saved.')
      setEditing(false)
      window.setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.')
    } finally {
      setLoading(false)
    }
  }, [draft, onProfileSaved, refreshUser, user, variant])

  const savePassword = useCallback(async () => {
    setPwLoading(true)
    setPwError(null)
    setPwSuccess(null)
    try {
      await patchMyPassword({
        currentPassword: passwordDraft.currentPassword,
        newPassword: passwordDraft.newPassword,
        confirmPassword: passwordDraft.confirmPassword,
      })
      setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwSuccess('Password updated.')
      setPasswordExpanded(false)
      window.setTimeout(() => setPwSuccess(null), 4000)
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Could not update password.')
    } finally {
      setPwLoading(false)
    }
  }, [passwordDraft])

  if (!user) return null

  if (usePortalLayout) {
    return (
      <div className={['space-y-3', className].filter(Boolean).join(' ')}>
        <div className="space-y-3">
          <div className={WS_ACCOUNT_CARD}>
            {success ? (
              <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50/90 px-3 py-2 text-xs font-medium text-emerald-900">
                {success}
              </div>
            ) : null}
            {error ? (
              <div className="mb-3 rounded-lg border border-red-100 bg-red-50/90 px-3 py-2 text-xs font-medium text-red-800">
                {error}
              </div>
            ) : null}
            <div className={`mb-3 flex flex-wrap items-center justify-between gap-2 ${wsSectionRule}`}>
              <h3 className={wsSectionTitle}>Profile</h3>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {editing ? (
                  <>
                    <button type="button" onClick={cancel} disabled={loading} className={WS_ACCT_SECONDARY}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveProfile()}
                      disabled={loading || !hasProfileChanges}
                      className={WS_ACCT_PRIMARY}
                    >
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setEditing(true)} className={WS_ACCT_SECONDARY}>
                    Edit profile
                  </button>
                )}
              </div>
            </div>
            {!editing ? (
              <div>
                <ViewRow label="First name" value={draft.firstName} />
                <ViewRow label="Last name" value={draft.lastName} />
                <ViewRow label="Email" value={draft.email} />
              </div>
            ) : (
              <div className="grid max-w-xl gap-x-4 gap-y-4 sm:grid-cols-2">
                <label className={wholesaleLabelClass}>
                  First name
                  <input
                    className={wholesaleInputClass}
                    value={draft.firstName}
                    onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                    autoComplete="given-name"
                  />
                </label>
                <label className={wholesaleLabelClass}>
                  Last name
                  <input
                    className={wholesaleInputClass}
                    value={draft.lastName}
                    onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                    autoComplete="family-name"
                  />
                </label>
                <div className="sm:col-span-2 sm:max-w-md">
                  <label className={wholesaleLabelClass}>
                    Email
                    <input
                      type="email"
                      className={wholesaleInputClass}
                      value={draft.email}
                      onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                      autoComplete="email"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {variant === 'wholesale' ? (
            <div className={WS_ACCOUNT_CARD}>
              <h3 className={`mb-3 ${wsSectionRule} ${wsSectionTitle}`}>Business details</h3>
              {!editing ? (
                <div>
                  <ViewRow label="Business name" value={draft.businessName} />
                  <ViewRow label="Business email" value={draft.contactEmail} />
                  <ViewRow label="ABN" value={draft.abn} />
                </div>
              ) : (
                <div className="grid max-w-md gap-y-4">
                  <label className={wholesaleLabelClass}>
                    Business name
                    <input
                      className={wholesaleInputClass}
                      value={draft.businessName}
                      onChange={(e) => setDraft((d) => ({ ...d, businessName: e.target.value }))}
                    />
                  </label>
                  <label className={wholesaleLabelClass}>
                    Business email
                    <input
                      type="email"
                      className={wholesaleInputClass}
                      value={draft.contactEmail}
                      onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
                      autoComplete="email"
                    />
                  </label>
                  <label className={wholesaleLabelClass}>
                    ABN
                    <input
                      className={wholesaleInputClass}
                      value={draft.abn}
                      onChange={(e) => setDraft((d) => ({ ...d, abn: e.target.value }))}
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className={WS_ACCOUNT_CARD}>
              <h3 className={`mb-3 ${wsSectionRule} ${wsSectionTitle}`}>Contact</h3>
              {!editing ? (
                <div>
                  <ViewRow label="Contact email" value={draft.contactEmail} />
                </div>
              ) : (
                <div className="max-w-md">
                  <label className={wholesaleLabelClass}>
                    Contact email
                    <input
                      type="email"
                      className={wholesaleInputClass}
                      value={draft.contactEmail}
                      onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
                      autoComplete="email"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className={WS_ACCOUNT_CARD}>
            <div className={`mb-3 flex gap-2.5 ${wsSectionRule}`}>
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <h3 className={wsSectionTitle}>Password</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">Update your password securely</p>
              </div>
            </div>
            {pwSuccess ? <p className="mb-2 text-sm text-emerald-800">{pwSuccess}</p> : null}
            {pwError ? <p className="mb-2 text-sm text-red-700">{pwError}</p> : null}
            {!passwordExpanded ? (
              <div className="flex min-h-[2.75rem] items-center justify-end">
                <button
                  type="button"
                  className={WS_ACCT_SECONDARY}
                  onClick={() => {
                    setPasswordExpanded(true)
                    setPwError(null)
                  }}
                >
                  Change password
                </button>
              </div>
            ) : (
              <div className="grid max-w-md gap-3.5">
                <label className={wholesaleLabelClass}>
                  Current password
                  <input
                    type="password"
                    className={wholesaleInputClass}
                    value={passwordDraft.currentPassword}
                    onChange={(e) => setPasswordDraft((d) => ({ ...d, currentPassword: e.target.value }))}
                    autoComplete="current-password"
                  />
                </label>
                <label className={wholesaleLabelClass}>
                  New password
                  <input
                    type="password"
                    className={wholesaleInputClass}
                    value={passwordDraft.newPassword}
                    onChange={(e) => setPasswordDraft((d) => ({ ...d, newPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </label>
                <label className={wholesaleLabelClass}>
                  Confirm new password
                  <input
                    type="password"
                    className={wholesaleInputClass}
                    value={passwordDraft.confirmPassword}
                    onChange={(e) => setPasswordDraft((d) => ({ ...d, confirmPassword: e.target.value }))}
                    autoComplete="new-password"
                  />
                </label>
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelPasswordPanel}
                    disabled={pwLoading}
                    className={WS_ACCT_SECONDARY}
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={() => void savePassword()} disabled={pwLoading} className={WS_ACCT_PRIMARY}>
                    {pwLoading ? 'Updating…' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 disabled:bg-neutral-50'

  return (
    <div className={['space-y-8', className].filter(Boolean).join(' ')}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">Profile</h3>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cancel}
                disabled={loading}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={loading}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {success ? (
          <p className="mt-3 text-sm text-emerald-800">{success}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">First name</span>
            <input
              className={inputClass}
              value={draft.firstName}
              onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
              disabled={!editing}
              autoComplete="given-name"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Last name</span>
            <input
              className={inputClass}
              value={draft.lastName}
              onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
              disabled={!editing}
              autoComplete="family-name"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Login email</span>
            <input
              type="email"
              className={inputClass}
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              disabled={!editing}
              autoComplete="email"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {variant === 'wholesale' ? 'Business contact email (optional)' : 'Contact email (optional)'}
            </span>
            <input
              type="email"
              className={inputClass}
              value={draft.contactEmail}
              onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
              disabled={!editing}
              autoComplete="email"
            />
          </label>
          {variant === 'wholesale' ? (
            <>
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Business name</span>
                <input
                  className={inputClass}
                  value={draft.businessName}
                  onChange={(e) => setDraft((d) => ({ ...d, businessName: e.target.value }))}
                  disabled={!editing}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">ABN (optional)</span>
                <input
                  className={inputClass}
                  value={draft.abn}
                  onChange={(e) => setDraft((d) => ({ ...d, abn: e.target.value }))}
                  disabled={!editing}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-6">
        <h3 className="text-sm font-semibold text-neutral-900">Change password</h3>
        {pwSuccess ? <p className="mt-3 text-sm text-emerald-800">{pwSuccess}</p> : null}
        {pwError ? <p className="mt-3 text-sm text-red-700">{pwError}</p> : null}
        <div className="mt-4 grid max-w-md gap-3">
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Current password</span>
            <input
              type="password"
              className={inputClass}
              value={passwordDraft.currentPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, currentPassword: e.target.value }))}
              autoComplete="current-password"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">New password</span>
            <input
              type="password"
              className={inputClass}
              value={passwordDraft.newPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, newPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Confirm new password</span>
            <input
              type="password"
              className={inputClass}
              value={passwordDraft.confirmPassword}
              onChange={(e) => setPasswordDraft((d) => ({ ...d, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </label>
          <button
            type="button"
            onClick={() => void savePassword()}
            disabled={pwLoading}
            className="mt-1 w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pwLoading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  )
}
