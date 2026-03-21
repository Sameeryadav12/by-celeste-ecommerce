import { apiFetch } from '../lib/api'
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

export async function signup(input: SignupInput): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }, SignupInput>('/api/auth/signup', {
    method: 'POST',
    body: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
  })
}

export async function login(input: LoginInput): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }, LoginInput>('/api/auth/login', {
    method: 'POST',
    body: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
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

export async function wholesaleApply(input: WholesaleApplyInput): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }, WholesaleApplyInput>('/api/auth/wholesale/apply', {
    method: 'POST',
    body: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
  })
}

