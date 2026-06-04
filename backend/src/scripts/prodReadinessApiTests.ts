/**
 * Production-readiness API smoke tests. Run with backend up:
 *   npx tsx src/scripts/prodReadinessApiTests.ts
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

async function api(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
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

type Result = { name: string; pass: boolean; detail?: string }

const results: Result[] = []
function ok(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`)
}

async function main() {
  console.log(`API base: ${BASE}\n`)

  // Public endpoints / empty states
  for (const path of [
    '/health',
    '/api/products?limit=2',
    '/api/events',
    '/api/testimonials',
    '/api/content/marketing',
    '/api/content/theme',
    '/api/categories',
  ]) {
    const r = await api('GET', path)
    ok(`GET ${path}`, r.status === 200, `status ${r.status}`)
  }

  // Admin login
  const adminLogin = await api('POST', '/api/auth/login', {
    email: 'admin.byceleste@gmail.com',
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? 'Admin123!',
  })
  ok(
    'Admin login',
    adminLogin.status === 200 && (adminLogin.json.data as { user?: { role?: string } })?.user?.role === 'ADMIN',
    `status ${adminLogin.status}`,
  )

  const adminMe = await api('GET', '/api/auth/me')
  ok('Admin session /me', adminMe.status === 200, `status ${adminMe.status}`)

  const adminDash = await api('GET', '/api/admin/summary')
  ok('Admin dashboard empty state', adminDash.status === 200, `status ${adminDash.status}`)

  const adminOrders = await api('GET', '/api/admin/orders')
  ok('Admin orders empty', adminOrders.status === 200, `status ${adminOrders.status}`)

  const adminEvents = await api('GET', '/api/admin/events')
  ok('Admin events empty', adminEvents.status === 200, `status ${adminEvents.status}`)

  const adminCustomers = await api('GET', '/api/admin/customers')
  ok('Admin customers empty', adminCustomers.status === 200, `status ${adminCustomers.status}`)

  // Wrong email admin blocked (jane is not admin login)
  await api('POST', '/api/auth/logout', {})
  cookieJar.clear()
  const janeTry = await api('POST', '/api/auth/login', {
    email: 'jane.byceleste@gmail.com',
    password: 'Admin123!',
  })
  ok(
    'Jane email cannot admin login',
    janeTry.status === 401,
    `status ${janeTry.status}`,
  )

  // Retail signup
  const uniq = Date.now()
  const customerEmail = `prodtest.customer.${uniq}@example.com`
  const signup = await api('POST', '/api/auth/signup', {
    firstName: 'Prod',
    lastName: 'Test',
    email: customerEmail,
    password: 'Customer1!',
  })
  ok('Customer signup', signup.status === 201 || signup.status === 200, `status ${signup.status}`)

  const custLogin = await api('POST', '/api/auth/login', {
    email: customerEmail,
    password: 'Customer1!',
  })
  ok('Customer login', custLogin.status === 200, `status ${custLogin.status}`)

  const adminBlocked = await api('GET', '/api/admin/dashboard/summary')
  ok('Customer blocked from admin API', adminBlocked.status === 403, `status ${adminBlocked.status}`)

  // Forgot password safe message
  const forgot = await api('POST', '/api/auth/forgot-password', {
    email: 'nobody@example.com',
  })
  ok(
    'Forgot password safe response',
    forgot.status === 200,
    String((forgot.json.data as { message?: string })?.message ?? forgot.status),
  )

  // Wholesale apply
  cookieJar.clear()
  const wsEmail = `prodtest.wholesale.${uniq}@example.com`
  const wsApply = await api('POST', '/api/auth/wholesale/apply', {
    firstName: 'Whole',
    lastName: 'Sale',
    email: wsEmail,
    password: 'Wholesale1!',
    businessName: 'Test Biz',
    abn: '12345678901',
  })
  ok('Wholesale application', wsApply.status === 201 || wsApply.status === 200, `status ${wsApply.status}`)

  const wsPendingLogin = await api('POST', '/api/auth/login', {
    email: wsEmail,
    password: 'Wholesale1!',
  })
  ok('Pending wholesale can login', wsPendingLogin.status === 200, `status ${wsPendingLogin.status}`)

  // Checkout without square real tokens
  const products = await api('GET', '/api/products?limit=1')
  const product = (products.json.data as { products?: { id: string }[] })?.products?.[0]
  if (product?.id) {
    cookieJar.clear()
    await api('POST', '/api/auth/login', { email: customerEmail, password: 'Customer1!' })
    const checkout = await api('POST', '/api/checkout/create-session', {
      cartItems: [{ productId: product.id, quantity: 1 }],
      firstName: 'Prod',
      lastName: 'Test',
      email: customerEmail,
      phone: '0400000000',
      addressLine1: '1 Test Street',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
    })
    ok(
      'Retail checkout session',
      checkout.status === 503 && (checkout.json.error as { code?: string })?.code === 'SQUARE_NOT_CONFIGURED',
      `status ${checkout.status} code ${(checkout.json.error as { code?: string })?.code ?? 'ok'}`,
    )
  } else {
    ok('Retail checkout session', false, 'no product')
  }

  // Secrets not in public config
  const theme = await api('GET', '/api/content/theme')
  const themeStr = JSON.stringify(theme.json)
  ok(
    'No JWT in public API',
    !themeStr.includes('JWT_ACCESS') && !themeStr.includes('SMTP_PASS'),
    '',
  )

  console.log('\n=== SUMMARY ===')
  const passed = results.filter((r) => r.pass).length
  const failed = results.filter((r) => !r.pass)
  console.log(`${passed}/${results.length} passed`)
  if (failed.length) {
    console.log('Failed:', failed.map((f) => f.name).join(', '))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
