import type { AuthUser } from './authTypes'

/** Accepts only same-origin style paths (prevents open redirects). */
export function safeInternalPath(path: unknown): string | null {
  if (typeof path !== 'string') return null
  const t = path.trim()
  if (!t.startsWith('/') || t.startsWith('//')) return null
  return t
}

export function defaultHomePathForUser(user: AuthUser): string {
  if (user.role === 'ADMIN') return '/admin'
  if (user.role === 'WHOLESALE' && user.wholesaleApprovalStatus === 'APPROVED') return '/wholesale'
  return '/account'
}

/**
 * After login: prefer `from` when it is a safe internal path; otherwise role-based home.
 */
export function resolvePostLoginPath(user: AuthUser, from: unknown): string {
  const internal = safeInternalPath(from)
  if (internal) return internal
  return defaultHomePathForUser(user)
}
