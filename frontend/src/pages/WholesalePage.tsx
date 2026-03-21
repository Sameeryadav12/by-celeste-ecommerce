import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { wholesaleApply } from '../auth/authApi'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Seo } from '../components/seo/Seo'

export function WholesalePage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [abn, setAbn] = useState('')
  const [wholesaleNotes, setWholesaleNotes] = useState('')

  async function handleApply(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await wholesaleApply({
        firstName,
        lastName,
        email,
        password,
        businessName,
        abn: abn.trim() || undefined,
        wholesaleNotes: wholesaleNotes.trim() || undefined,
      })
      await refreshUser()
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo
        title="Wholesale | By Celeste"
        description="Apply for wholesale access to By Celeste. Wholesale pricing is available after approval."
      />
      <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Wholesale</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-700">
          By Celeste offers a separate path for stockists and professional partners. After{' '}
          <strong>approval</strong>, trade unit prices appear automatically in the shop and at
          checkout—no codes needed. Until then, you shop at retail prices like everyone else. Retail
          visitors never see business pricing.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">How it works</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-neutral-700">
          <li>You create a wholesale account using the application form below (or sign in if you already applied).</li>
          <li>Our team reviews your business details. Until then, your status is <strong>pending</strong>.</li>
          <li>
            When approved, signed-in wholesale customers automatically see trade unit prices in the
            shop and at checkout—the same catalog, priced for stockists.
          </li>
          <li>
            Benefits: straightforward ordering through the site, Australian-made positioning for
            your shelves, and a single place to reorder favourites.
          </li>
          <li>For coursework, approval status can be updated in the database; admin tools may expand later.</li>
        </ul>
        <p className="mt-4 text-sm text-neutral-600">
          Already have a retail account? Use a <strong>different email</strong> for wholesale, or contact us to merge
          requests manually.
        </p>
      </Card>

      {user?.role === 'WHOLESALE' ? (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Your wholesale account</h2>
          <p className="mt-2 text-sm text-neutral-700">
            You are signed in as a wholesale applicant. Check your{' '}
            <Link to="/account" className="font-medium text-neutral-900 underline-offset-2 hover:underline">
              Account
            </Link>{' '}
            page for approval status and business details on file.
          </p>
          <p className="mt-3 text-sm text-neutral-600">
            Business: <span className="font-medium text-neutral-800">{user.businessName ?? '—'}</span>
          </p>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Apply for wholesale access</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Submitting creates your wholesale login (pending review). You will be signed in automatically.
              </p>
            </div>
            <Link
              to="/login"
              className="shrink-0 text-sm font-medium text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Already applied? Sign in
            </Link>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleApply} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">First name</span>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Last name</span>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium text-neutral-800">Business name</span>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Password</span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <span className="text-xs text-neutral-500">
                Same rules as retail signup: 8+ chars, upper, lower, digit, symbol.
              </span>
            </label>
            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium text-neutral-800">ABN (optional)</span>
              <input
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="font-medium text-neutral-800">Notes for our team (optional)</span>
              <textarea
                rows={3}
                value={wholesaleNotes}
                onChange={(e) => setWholesaleNotes(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application & sign in'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      </section>
    </>
  )
}
