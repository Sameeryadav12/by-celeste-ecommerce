/**
 * API base URL for `fetch`.
 * - **Development:** empty string → same-origin `/api` (Vite proxy → backend).
 * - **Production (Vercel + Render):** set `VITE_API_BASE_URL` to the public API origin, e.g.
 *   `https://your-service.onrender.com` (no trailing slash). Do not leave production pointing at localhost.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? '' : ''
}

const API_BASE_URL = resolveApiBaseUrl()

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: HttpMethod
    body?: TBody
    signal?: AbortSignal
  } = {},
): Promise<TResponse> {
  const { method = 'GET', body, signal } = options

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers:
      body !== undefined
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal,
  })

  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = (isJson ? await res.json() : null) as
    | { success: boolean; data?: unknown; error?: { code: string; message: string; details?: unknown } }
    | null

  if (!res.ok || !data || data.success === false) {
    const message =
      data?.error?.message ||
      'Something went wrong while talking to the server. Please try again.'
    throw new Error(message)
  }

  return data.data as TResponse
}

