import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { useAuth } from '../../auth/auth-context'
import { btnPrimary, cardCls, inputCls, labelCls } from '../../lib/styles'
import Notice from '../../components/Notice'

export default function SettingsAdmin() {
  const { session } = useAuth()
  const [email, setEmail] = useState(session?.user.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdateEmail(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    const newEmail = email.trim()
    if (!newEmail) {
      setError('Email cannot be empty.')
      return
    }

    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ email: newEmail })
    setBusy(false)

    if (err) setError(explainError(err))
    else setSuccess('Login email updated successfully!')
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    if (!currentPassword) {
      setError('Enter your current password.')
      return
    }

    if (!newPassword) {
      setError('Enter a new password.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setBusy(true)

    // 1. Verify current password by signing in / re-authenticating
    const userEmail = session?.user.email
    if (!userEmail) {
      setError('User session not found.')
      setBusy(false)
      return
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    })

    if (signInErr) {
      setBusy(false)
      setError('Incorrect current password.')
      return
    }

    // 2. Proceed with updating to the new password
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setBusy(false)

    if (err) {
      setError(explainError(err))
    } else {
      setSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="space-y-6">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHANGE EMAIL */}
        <div className={`${cardCls} p-6 sm:p-8 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-3 border-b border-sand-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-forest-800">Change Login Email</h2>
                <p className="text-xs text-slate-500">Update the Gmail address you use to sign in.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="admin-email" className={labelCls}>Login Email (Gmail)</label>
                <input id="admin-email" type="email" className={inputCls} value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={busy} required />
              </div>
              <button type="submit" className={btnPrimary} disabled={busy}>
                {busy ? 'Updating...' : 'Update email'}
              </button>
            </form>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className={`${cardCls} p-6 sm:p-8 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-3 border-b border-sand-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-forest-800">Change Password</h2>
                <p className="text-xs text-slate-500">Choose a secure new password for your account.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="current-password" className={labelCls}>Current Password</label>
                <input id="current-password" type="password" className={inputCls} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} disabled={busy} placeholder="Enter current password" />
              </div>

              <div>
                <label htmlFor="new-password" className={labelCls}>New Password</label>
                <input id="new-password" type="password" className={inputCls} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} disabled={busy} placeholder="At least 6 characters" />
              </div>

              <div>
                <label htmlFor="confirm-password" className={labelCls}>Confirm New Password</label>
                <input id="confirm-password" type="password" className={inputCls} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={busy} placeholder="Re-type new password" />
              </div>

              <button type="submit" className={btnPrimary} disabled={busy}>
                {busy ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}