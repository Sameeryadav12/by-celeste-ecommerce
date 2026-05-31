import { apiFetch, getApiBaseUrl } from '../lib/api'
import type { AuthUser } from './authTypes'

export type SignupInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

export type LoginTotpInput = {
  twoFactorToken: string
  code: string
}

export type LoginResult =
  | { user: AuthUser }
  | { requiresTwoFactor: true; twoFactorToken: string }

async function postAuthJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = (isJson ? await res.json() : null) as
    | { success: boolean; data?: unknown; error?: { code: string; message: string } }
    | null

  if (!res.ok || !data || data.success === false) {
    const message =
      data?.error?.message ||
      'Something went wrong while talking to the server. Please try again.'
    throw new Error(message)
  }

  return data.data as T
}

export async function signup(input: SignupInput): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }, SignupInput>('/api/auth/signup', {
    method: 'POST',
    body: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
  })
}

export async function login(input: LoginInput): Promise<LoginResult> {
  return postAuthJson<LoginResult>('/api/auth/login', {
    ...input,
    email: input.email.trim().toLowerCase(),
  })
}

export async function loginTotp(input: LoginTotpInput): Promise<{ user: AuthUser }> {
  return postAuthJson<{ user: AuthUser }>('/api/auth/login/totp', {
    twoFactorToken: input.twoFactorToken,
    code: input.code.trim().replace(/\s+/g, ''),
  })
}

export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  })
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>('/api/auth/me', {
    method: 'GET',
  })
}

export type WholesaleApplyInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  businessName: string
  abn?: string
  wholesaleNotes?: string
}

export async function forgotPassword(input: { email: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: input.email.trim().toLowerCase() },
  })
}

export async function resetPassword(input: {
  token: string
  newPassword: string
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: {
      token: input.token,
      newPassword: input.newPassword,
    },
  })
}

export async function wholesaleApply(input: WholesaleApplyInput): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }, WholesaleApplyInput>('/api/auth/wholesale/apply', {
    method: 'POST',
    body: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
  })
}

