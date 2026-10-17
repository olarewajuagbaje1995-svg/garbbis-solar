import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { AuthContext } from './auth-context'
import type { AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [isAdminRow, setIsAdminRow] = useState(false)
  const [roleCheckedFor, setRoleCheckedFor] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoaded(true)
    })
    // The callback only stores the session. It makes no other Supabase calls itself.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setSessionLoaded(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null

  // Looks up the user's role. This is for the UI only; the database enforces access with RLS.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsAdminRow(data?.role === 'admin')
        setRoleCheckedFor(userId)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return null
    if (/invalid login credentials/i.test(error.message)) return 'Incorrect email or password.'
    return explainError(error)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthState>(() => {
    const roleResolved = userId !== null && roleCheckedFor === userId
    return {
      session,
      isAdmin: roleResolved && isAdminRow,
      loading: !sessionLoaded || (userId !== null && !roleResolved),
      signIn,
      signOut,
    }
  }, [session, sessionLoaded, userId, roleCheckedFor, isAdminRow, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}