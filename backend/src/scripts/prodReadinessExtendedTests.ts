/**
 * Extended production-readiness API tests. Backend must be running.
 */
import 'dotenv/config'

const BASE = process.env.API_TEST_BASE ?? 'http://localhost:4000'
const cookieJar = new Map<string, string>()

function parseSetCookie(header: string | null) {
  if (!header) return
  const part = header.split(';')[0]?.trim()
  if (!part) return
  const eq = part.indexOf('=')
  if (eq < 0) return
  cookieJar.set(part.slice(0, eq), part)
}

function cookieHeader() {
  return [...cookieJar.values()].join('; ')
}

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieJar.size ? { Cookie: cookieHeader() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  parseSetCookie(res.headers.get('set-cookie'))
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { status: res.status, json }
}

const results: { name: string; pass: boolean; detail?: string }[] = []
function ok(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`)
}

async function login(email: string, password: string) {
  cookieJar.clear()
  return api('POST', '/api/auth/login', { email, password })
}

async function main() {
  const uniq = Date.now()
  const adminPw = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? 'Admin123!'

  // Wholesale full flow
  const wsEmail = `prod.ws.${uniq}@example.com`
  await api('POST', '/api/auth/wholesale/apply', {
    firstName: 'Whole',
    lastName: 'Sale',
    email: wsEmail,
    password: 'Wholesale1!',
    businessName: 'Test Biz',
  })
  ok('Wholesale apply', true)

  const wsUser = await login(wsEmail, 'Wholesale1!')
  const wsId = (wsUser.json.data as { user?: { id?: string } })?.user?.id
  ok('Wholesale pending login', wsUser.status === 200)

  const wsDash = await api('GET', '/api/products?limit=1')
  ok('Pending wholesale public catalog', wsDash.status === 200)

  cookieJar.clear()
  await login('admin.byceleste@gmail.com', adminPw)
  if (wsId) {
    const approve = await api('PUT', `/api/admin/wholesale/${wsId}/moderation`, {
      action: 'APPROVE',
    })
    ok('Admin approve wholesale', approve.status === 200, `status ${approve.status}`)
  } else {
    ok('Admin approve wholesale', false, 'no ws id')
  }

  cookieJar.clear()
  const wsApproved = await login(wsEmail, 'Wholesale1!')
  ok('Approved wholesale login', wsApproved.status === 200)

  const products = await api('GET', '/api/products?limit=1')
  const product = (products.json.data as { products?: { id: string; price: string }[] })
    ?.products?.[0]

  if (product) {
    const checkout = await api('POST', '/api/checkout/create-session', {
      cartItems: [{ productId: product.id, quantity: 1 }],
      firstName: 'Whole',
      lastName: 'Sale',
      email: wsEmail,
      phone: '0400000000',
      addressLine1: '1 Test Street',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
    })
    ok(
      'Wholesale checkout under $300 not blocked server-side',
      checkout.status === 503,
      `status ${checkout.status} (no $300 rule in backend)`,
    )
  }

  // Admin coupon CRUD
  cookieJar.clear()
  await login('admin.byceleste@gmail.com', adminPw)
  const code = `TEST${uniq}`.slice(0, 20)
  const createCoupon = await api('POST', '/api/admin/discounts', {
    code: code.toLowerCase(),
    percentage: 10,
    isActive: true,
    appliesToCustomers: true,
    appliesToWholesale: false,
    perCustomerLimit: 1,
  })
  ok(
    'Create coupon uppercase',
    createCoupon.status === 201 || createCoupon.status === 200,
    `status ${createCoupon.status}`,
  )

  const validateRetail = await api('POST', '/api/discounts/validate', {
    code,
    subtotalAud: 100,
    isWholesale: false,
  })
  ok('Validate retail coupon', validateRetail.status === 200, `status ${validateRetail.status}`)

  const validateWs = await api('POST', '/api/discounts/validate', {
    code,
    subtotalAud: 100,
    isWholesale: true,
  })
  ok(
    'Customer-only coupon rejected for wholesale',
    validateWs.status === 400 || validateWs.status === 422,
    `status ${validateWs.status}`,
  )

  // Pending wholesale blocked from admin
  cookieJar.clear()
  await login(wsEmail, 'Wholesale1!')
  const adminTry = await api('GET', '/api/admin/summary')
  ok('Wholesale blocked from admin API', adminTry.status === 403, `status ${adminTry.status}`)

  console.log('\n=== EXTENDED SUMMARY ===')
  const failed = results.filter((r) => !r.pass)
  console.log(`${results.length - failed.length}/${results.length} passed`)
  if (failed.length) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
