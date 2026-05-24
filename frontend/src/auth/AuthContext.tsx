import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthStatus, AuthUser } from './authTypes'
import {
  fetchCurrentUser,
  login as apiLogin,
  loginTotp as apiLoginTotp,
  logout as apiLogout,
  signup as apiSignup,
  type LoginResult,
} from './authApi'

type LoginOutcome = AuthUser | Extract<LoginResult, { requiresTwoFactor: true }>

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  login: (input: { email: string; password: string }) => Promise<LoginOutcome>
  completeLoginWithTotp: (input: { twoFactorToken: string; code: string }) => Promise<AuthUser>
  signup: (input: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshUser = useCallback(async () => {
    setStatus((prev) => (prev === 'idle' ? 'loading' : prev))
    try {
      const result = await fetchCurrentUser()
      setUser(result.user)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (input: { email: string; password: string }) => {
    const data = await apiLogin(input)
    if ('requiresTwoFactor' in data) {
      return data
    }
    setUser(data.user)
    setStatus('authenticated')
    return data.user
  }, [])

  const completeLoginWithTotp = useCallback(async (input: { twoFactorToken: string; code: string }) => {
    const { user } = await apiLoginTotp(input)
    setUser(user)
    setStatus('authenticated')
    return user
  }, [])

  const signup = useCallback(
    async (input: {
      firstName: string
      lastName: string
      email: string
      password: string
    }) => {
      const result = await apiSignup(input)
      setUser(result.user)
      setStatus('authenticated')
      return result.user
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      completeLoginWithTotp,
      signup,
      logout,
      refreshUser,
    }),
    [login, completeLoginWithTotp, logout, refreshUser, signup, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

