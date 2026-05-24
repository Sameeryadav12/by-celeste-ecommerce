import { Link, useParams } from 'react-router-dom'

import { useEffect, useState, type ReactNode } from 'react'

import { Card } from '../../components/ui/Card'

import { Button } from '../../components/ui/Button'

import {

  EMPTY_ADMIN_CUSTOMER_SPENDING,

  getAdminCustomer,

  updateAdminCustomerNotes,

  updateAdminCustomerStatus,

  type AdminCustomerDetail,

} from '../../features/admin/adminApi'

import { formatOrderNumber } from '../../lib/orderNumber'
import { AdminStatusBadge } from './components/AdminStatusBadge'



const NOTES_MAX = 5000



export function AdminCustomerDetailPage() {

  const { id } = useParams<{ id: string }>()

  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null)

  const [notesDraft, setNotesDraft] = useState('')

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const [message, setMessage] = useState<string | null>(null)

  const [statusBusy, setStatusBusy] = useState(false)

  const [notesBusy, setNotesBusy] = useState(false)



  async function load() {

    if (!id) return

    setLoading(true)

    setError(null)

    try {

      const data = await getAdminCustomer(id)

      setCustomer(data)

      setNotesDraft(data.adminNotes)

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Could not load customer.')

    } finally {

      setLoading(false)

    }

  }



  useEffect(() => {

    void load()

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [id])



  async function handleToggleActive() {

    if (!id || !customer || customer.role === 'ADMIN') return



    const action = customer.isActive ? 'deactivate' : 'reactivate'

    const ok = window.confirm(

      customer.isActive

        ? `Deactivate ${customer.firstName} ${customer.lastName}? They will not be able to sign in until reactivated.`

        : `Reactivate ${customer.firstName} ${customer.lastName}? They will be able to sign in again.`,

    )

    if (!ok) return



    setStatusBusy(true)

    setError(null)

    setMessage(null)

    try {

      const result = await updateAdminCustomerStatus(id, !customer.isActive)

      setCustomer((prev) => (prev ? { ...prev, isActive: result.customer.isActive } : prev))

      setMessage(result.message)

    } catch (e) {

      setError(e instanceof Error ? e.message : `Could not ${action} account.`)

    } finally {

      setStatusBusy(false)

    }

  }



  async function handleSaveNotes() {

    if (!id || !customer) return

    setNotesBusy(true)

    setError(null)

    setMessage(null)

    try {

      const result = await updateAdminCustomerNotes(id, notesDraft)

      setNotesDraft(result.adminNotes)

      setCustomer((prev) => (prev ? { ...prev, adminNotes: result.adminNotes } : prev))

      setMessage('Admin notes saved.')

    } catch (e) {

      setError(e instanceof Error ? e.message : 'Could not save notes.')

    } finally {

      setNotesBusy(false)

    }

  }



  const notesDirty = customer ? notesDraft !== customer.adminNotes : false

  const mailtoHref = customer

    ? `mailto:${encodeURIComponent(customer.email)}?subject=${encodeURIComponent('By Celeste')}`

    : '#'



  if (!id) {

    return (

      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

        Customer id is missing.

      </div>

    )

  }



  if (loading) {

    return <p className="text-sm text-slate-500">Loading customer…</p>

  }



  if (error && !customer) {

    return (

      <div className="space-y-4">

        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

        <Link

          to="/admin/customers"

          className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"

        >

          Back to customers

        </Link>

      </div>

    )

  }



  if (!customer) return null



  const canToggleStatus = customer.role !== 'ADMIN'

  const isWholesale = customer.role === 'WHOLESALE'

  const spending = customer.spending ?? EMPTY_ADMIN_CUSTOMER_SPENDING



  return (

    <div className="space-y-5">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">

            {customer.firstName} {customer.lastName}

          </h1>

          <p className="mt-1 text-sm text-slate-500">{customer.email}</p>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <a

            href={mailtoHref}

            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"

          >

            Email customer

          </a>

          <Link

            to="/admin/customers"

            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"

          >

            Back to customers

          </Link>

        </div>

      </div>



      {message ? (

        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

          {message}

        </div>

      ) : null}

      {error ? (

        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          {error}

        </div>

      ) : null}



      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">

        <Card className="!p-4">

          <h2 className="text-base font-semibold text-slate-900">Profile</h2>

          <dl className="mt-3 space-y-2 text-sm">

            <Row label="Name" value={`${customer.firstName} ${customer.lastName}`} />

            <Row label="Email" value={customer.email} />

            {customer.contactEmail ? (

              <Row label="Contact email" value={customer.contactEmail} />

            ) : null}

            <Row label="Role" value={customer.role} />

            <Row label="Account status">

              <AdminStatusBadge status={customer.isActive ? 'ACTIVE' : 'INACTIVE'} />

            </Row>

            <Row label="Signed up" value={formatDateTime(customer.createdAt)} />

            {customer.lastLoginAt ? (

              <Row label="Last login" value={formatDateTime(customer.lastLoginAt)} />

            ) : null}

          </dl>

        </Card>



        <Card className="!p-4">

          <h2 className="text-base font-semibold text-slate-900">Spending summary</h2>

          <p className="mt-1 text-xs text-slate-500">Paid orders only.</p>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <Stat label="Total spent" value={formatAud(spending.totalSpentAud)} />

            <Stat label="Paid orders" value={String(spending.paidOrderCount)} />

            <Stat label="Loyalty points" value={String(customer.loyaltyPointsBalance)} />

            <Stat label="All orders" value={String(customer.orderCount)} />

          </div>

          {spending.lastPaidOrderAt ? (

            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">

              Last paid order: {formatDateTime(spending.lastPaidOrderAt)}

              {spending.lastPaidOrderTotal

                ? ` · ${formatAud(spending.lastPaidOrderTotal)}`

                : null}

            </p>

          ) : (

            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">

              No paid orders yet.

            </p>

          )}

          {isWholesale ? (

            <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">

              <Row

                label="Wholesale"

                value={customer.wholesaleApprovalStatus.replace(/_/g, ' ')}

              />

              {customer.businessName ? <Row label="Business" value={customer.businessName} /> : null}

            </dl>

          ) : null}

        </Card>

      </div>



      <Card className="!p-4">

        <h2 className="text-base font-semibold text-slate-900">Private admin notes</h2>

        <p className="mt-1 text-xs text-slate-500">

          Visible to admins only. Not shown to the customer.

        </p>

        <textarea

          value={notesDraft}

          onChange={(e) => setNotesDraft(e.target.value.slice(0, NOTES_MAX))}

          rows={4}

          placeholder="Internal notes about this account…"

          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900"

        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">

          <span className="text-xs text-slate-500">

            {notesDraft.length} / {NOTES_MAX}

          </span>

          <Button

            type="button"

            variant="primary"

            loading={notesBusy}

            disabled={notesBusy || !notesDirty}

            onClick={() => void handleSaveNotes()}

          >

            Save notes

          </Button>

        </div>

      </Card>



      <Card className="!p-4">

        <h2 className="text-base font-semibold text-slate-900">Account actions</h2>

        {canToggleStatus ? (

          <div className="mt-3 flex flex-wrap items-center gap-3">

            <Button

              type="button"

              variant={customer.isActive ? 'primary' : 'ghost'}

              className={

                customer.isActive

                  ? '!bg-red-700 hover:!bg-red-800'

                  : undefined

              }

              loading={statusBusy}

              disabled={statusBusy}

              onClick={() => void handleToggleActive()}

            >

              {customer.isActive ? 'Deactivate account' : 'Reactivate account'}

            </Button>

            <p className="text-xs text-slate-500">Password reset unavailable in demo.</p>

          </div>

        ) : (

          <p className="mt-2 text-sm text-slate-500">Administrator accounts are not managed here.</p>

        )}

      </Card>



      <Card className="!p-4">

        <h2 className="text-base font-semibold text-slate-900">Order history</h2>

        {customer.orders.length === 0 ? (

          <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center">

            <p className="text-sm font-medium text-slate-700">No orders placed yet.</p>

            <p className="mt-1 text-xs text-slate-500">

              Completed customer orders will appear here.

            </p>

          </div>

        ) : (

          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">

            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-4 py-2.5 font-medium">Date</th>

                  <th className="px-4 py-2.5 font-medium">Order</th>

                  <th className="px-4 py-2.5 font-medium">Status</th>

                  <th className="px-4 py-2.5 font-medium">Payment</th>

                  <th className="px-4 py-2.5 font-medium">Total</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">

                {customer.orders.map((o) => (

                  <tr key={o.id}>

                    <td className="px-4 py-2.5 text-slate-600">{formatDateTime(o.createdAt)}</td>

                    <td className="px-4 py-2.5">

                      <Link

                        to={`/admin/orders/${o.id}`}

                        className="font-medium text-slate-900 underline-offset-4 hover:underline"

                      >

                        {formatOrderNumber(o.orderNumber)}

                      </Link>

                    </td>

                    <td className="px-4 py-2.5">

                      <AdminStatusBadge status={o.status} />

                    </td>

                    <td className="px-4 py-2.5">

                      <AdminStatusBadge status={o.paymentStatus} />

                    </td>

                    <td className="px-4 py-2.5 font-medium">{formatAud(o.totalAmount)}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

    </div>

  )

}



function Stat({ label, value }: { label: string; value: string }) {

  return (

    <div className="rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2">

      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-0.5 text-lg font-semibold text-slate-900">{value}</p>

    </div>

  )

}



function Row({

  label,

  value,

  children,

}: {

  label: string

  value?: string

  children?: ReactNode

}) {

  return (

    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">

      <dt className="text-slate-500">{label}</dt>

      <dd className="font-medium text-slate-900">{children ?? value}</dd>

    </div>

  )

}



function formatDateTime(iso: string) {

  return new Date(iso).toLocaleString('en-AU', {

    day: 'numeric',

    month: 'short',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',

  })

}



function formatAud(value: string) {

  const n = Number(value)

  if (!Number.isFinite(n)) return value

  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)

}

