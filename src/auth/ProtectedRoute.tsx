import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from '../components/Loading'
import { btnSecondary } from '../lib/styles'
import { useAuth } from './auth-context'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <Loading label="Checking your session..." />
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Not authorised</h1>
        <p className="mt-2 text-sm text-slate-600">
          This account is signed in but does not have administrator access.
        </p>
        <button type="button" className={`${btnSecondary} mt-4`} onClick={() => void signOut()}>
          Log out
        </button>
      </div>
    )
  }
  return <>{children}</>
}