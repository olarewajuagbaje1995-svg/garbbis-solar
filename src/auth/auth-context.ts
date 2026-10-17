import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthState {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  /** Resolves to null on success, or a readable error message. */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}