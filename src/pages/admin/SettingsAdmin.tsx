import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, Mail, Eye, EyeOff, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { useAuth } from '../../auth/auth-context'
import { btnPrimary, cardCls, inputCls, labelCls } from '../../lib/styles'
import Notice from '../../components/Notice'

export default function SettingsAdmin() {
  const { session } = useAuth()
  const [email, setEmail] = useState(session?.user.email ?? '')
  const [adminName, setAdminName] = useState(session?.user.user_metadata?.full_name ?? '')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Toggle visibility states
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    // Call our secure Postgres function to update and confirm the email instantly
    const { error: err } = await supabase.rpc('update_user_email', { new_email: newEmail })
    setBusy(false)

    if (err) {
      setError(explainError(err))
    } else {
      setSuccess('Login email updated successfully! Refreshing session...')
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  async function handleUpdateAdminProfile(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    const name = adminName.trim()
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({
      data: { full_name: name },
    })
    setBusy(false)

    if (err) {
      setError(explainError(err))
    } else {
      setSuccess('Admin profile updated successfully!')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    const form = e.currentTarget as HTMLFormElement
    const currPassInput = (form.elements.namedItem('current-password') as HTMLInputElement)?.value || currentPassword
    const newPassInput = (form.elements.namedItem('new-password') as HTMLInputElement)?.value || newPassword
    const confirmPassInput = (form.elements.namedItem('confirm-password') as HTMLInputElement)?.value || confirmPassword

    if (!currPassInput) {
      setError('Enter your current password.')
      return
    }

    if (!newPassInput) {
      setError('Enter a new password.')
      return
    }

    if (newPassInput.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassInput !== confirmPassInput) {
      setError('New passwords do not match.')
      return
    }

    setBusy(true)

    // 1. Verify current password by signing in
    const userEmail = session?.user.email
    if (!userEmail) {
      setError('User session not found.')
      setBusy(false)
      return
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currPassInput,
    })

    if (signInErr) {
      setBusy(false)
      setError('Incorrect current password.')
      return
    }

    // 2. Update password
    const { error: err } = await supabase.auth.updateUser({ password: newPassInput })
    setBusy(false)

    if (err) {
      setError(explainError(err))
    } else {
      setSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      form.reset()
    }
  }

  return (
    <div className="space-y-6">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHANGE EMAIL & ADMIN PROFILE */}
        <div className={`${cardCls} p-6 sm:p-8 flex flex-col justify-between space-y-8`}>
          <div>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-[#071726]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#071726]">Change Login Email</h2>
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

          {/* UPDATE ADMIN PROFILE NAME */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-[#071726]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#071726]">Admin Profile</h2>
                <p className="text-xs text-slate-500">Update your administrator display name.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateAdminProfile} className="space-y-4" noValidate>
              <div>
                <label htmlFor="admin-name" className={labelCls}>Display Name</label>
                <input id="admin-name" type="text" className={inputCls} value={adminName}
                  onChange={(e) => setAdminName(e.target.value)} disabled={busy} placeholder="e.g. Agbaje Olarewaju" />
              </div>
              <button type="submit" className={btnPrimary} disabled={busy}>
                {busy ? 'Updating...' : 'Update admin profile'}
              </button>
            </form>
          </div>
        </div>

        {/* CHANGE PASSWORD WITH SHOW/HIDE EYE ICONS */}
        <div className={`${cardCls} p-6 sm:p-8 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-[#071726]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#071726]">Change Password</h2>
                <p className="text-xs text-slate-500">Choose a secure new password for your account.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4" noValidate>
              {/* Current Password */}
              <div>
                <label htmlFor="current-password" className={labelCls}>Current Password</label>
                <div className="relative flex items-center">
                  <input 
                    id="current-password" 
                    name="current-password" 
                    type={showCurrent ? "text" : "password"} 
                    className={`${inputCls} pr-12 w-full`} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    disabled={busy} 
                    placeholder="Enter current password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className={labelCls}>New Password</label>
                <div className="relative flex items-center">
                  <input 
                    id="new-password" 
                    name="new-password" 
                    type={showNew ? "text" : "password"} 
                    className={`${inputCls} pr-12 w-full`} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} 
                    disabled={busy} 
                    placeholder="At least 6 characters" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirm-password" className={labelCls}>Confirm New Password</label>
                <div className="relative flex items-center">
                  <input 
                    id="confirm-password" 
                    name="confirm-password" 
                    type={showConfirm ? "text" : "password"} 
                    className={`${inputCls} pr-12 w-full`} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    disabled={busy} 
                    placeholder="Re-type new password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" className={`${btnPrimary} mt-2`} disabled={busy}>
                {busy ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}