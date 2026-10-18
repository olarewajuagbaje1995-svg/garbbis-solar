import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoaderCircle, ShieldCheck, Sun, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { BUSINESS, LOGO_SRC } from '../../lib/config'
import { btnPrimary, cardCls, inputCls, labelCls } from '../../lib/styles'
import { usePageTitle } from '../../lib/usePageTitle'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'

export default function AdminLogin() {
  usePageTitle('Admin login')
  const { session, isAdmin, loading, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (loading) return <Loading label="Checking your session..." />
  if (session && isAdmin) return <Navigate to="/admin" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    setError(null)
    const message = await signIn(email.trim(), password)
    setBusy(false)
    if (message) setError(message)
    else navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-forest-900 via-forest-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl">
            {logoFailed ? (
              <Sun className="h-10 w-10 text-forest-700" />
            ) : (
              <img src={LOGO_SRC} alt={BUSINESS.shortName} className="h-12 w-auto object-contain"
                onError={() => setLogoFailed(true)} />
            )}
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">{BUSINESS.name}</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-yellow-400">Secure Management Portal</p>
        </div>

        <div className={`${cardCls} p-8 shadow-2xl`}>
          <div className="flex items-center gap-2 border-b border-sand-200 pb-4">
            <ShieldCheck className="h-5 w-5 text-forest-700" />
            <div>
              <h2 className="font-bold text-slate-900">Admin login</h2>
              <p className="text-xs text-slate-500">Authorised administrators only.</p>
            </div>
          </div>

          {session && !isAdmin && (
            <div className="mt-4 space-y-2">
              <Notice variant="error">This account does not have administrator access.</Notice>
              <button type="button" className="text-sm font-semibold text-forest-700 underline" onClick={() => void signOut()}>
                Log out and try another account
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
            {error && <Notice variant="error">{error}</Notice>}
            <div>
              <label htmlFor="email" className={labelCls}>Email address</label>
              <input id="email" type="email" autoComplete="username" className={inputCls} value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={busy} placeholder="admin@example.com" />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative flex items-center">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password" 
                  className={`${inputCls} pr-12 w-full`}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={busy} 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className={`${btnPrimary} w-full py-3`} disabled={busy}>
              {busy ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Logging in...</> : 'Log in to Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
        </p>
      </div>
    </div>
  )
}