import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Trash2, Users, UserCheck, UploadCloud, Edit2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { btnPrimary, cardCls, inputCls, labelCls } from '../../lib/styles'
import Notice from '../../components/Notice'

interface TeamMember {
  id: string
  name: string
  role_title: string
  description?: string
  image_url: string
  is_ceo: boolean
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [isCeo, setIsCeo] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setMembers(data)
  }

  function handleStartEdit(member: TeamMember) {
    setEditingId(member.id)
    setName(member.name)
    setRole(member.role_title)
    setDescription(member.description || '')
    setIsCeo(member.is_ceo)
    setExistingImageUrl(member.image_url)
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setName('')
    setRole('')
    setDescription('')
    setIsCeo(false)
    setExistingImageUrl('')
    setImageFile(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    if (!editingId) {
      const currentTeamCount = members.filter(m => !m.is_ceo).length
      if (!isCeo && currentTeamCount >= 10) {
        setError('Maximum limit of 10 team members reached.')
        return
      }
    }

    if (!name || !role || (!imageFile && !existingImageUrl)) {
      setError('Name, Role, and an Image are required.')
      return
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    setBusy(true)

    try {
      let publicUrl = existingImageUrl

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `team/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadErr } = await supabase.storage
          .from('media')
          .upload(fileName, imageFile)

        if (uploadErr) throw uploadErr

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)
        
        publicUrl = newUrl
      }

      if (editingId) {
        const { error: updateErr } = await supabase
          .from('team_members')
          .update({
            name,
            role_title: role,
            description,
            image_url: publicUrl,
            is_ceo: isCeo
          })
          .eq('id', editingId)

        if (updateErr) throw updateErr
        setSuccess(`${name} updated successfully!`)
      } else {
        const { error: insertErr } = await supabase.from('team_members').insert([{
          name,
          role_title: role,
          description,
          image_url: publicUrl,
          is_ceo: isCeo
        }])

        if (insertErr) throw insertErr
        setSuccess(`${name} added successfully!`)
      }

      handleCancelEdit()
      fetchMembers()
    } catch (err: any) {
      setError(explainError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return
    
    setBusy(true)
    setError(null)
    const { error: deleteErr } = await supabase.from('team_members').delete().eq('id', id)
    setBusy(false)

    if (deleteErr) {
      setError(explainError(deleteErr))
    } else {
      setSuccess(`${name} removed.`)
      fetchMembers()
    }
  }

  const ceo = members.find(m => m.is_ceo)
  const team = members.filter(m => !m.is_ceo)

  return (
    <div className="space-y-8">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ADD / EDIT FORM */}
        <div className={`lg:col-span-1 h-fit ${cardCls} p-6 ${editingId ? 'border-2 border-yellow-400 bg-yellow-50/20' : ''}`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071726] text-yellow-400">
                {editingId ? <Edit2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#071726]">{editingId ? 'Edit Member' : 'Add Member'}</h2>
                <p className="text-xs text-slate-500">{editingId ? 'Update profile info' : 'Add CEO or Team'}</p>
              </div>
            </div>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name</label>
              <input required type="text" className={inputCls} value={name} onChange={e => setName(e.target.value)} disabled={busy} />
            </div>

            <div>
              <label className={labelCls}>Role / Title</label>
              <input required type="text" className={inputCls} value={role} onChange={e => setRole(e.target.value)} disabled={busy} placeholder="e.g. Chief Executive Officer" />
            </div>

            <div>
              <label className={labelCls}>Description (Optional)</label>
              <textarea rows={3} className={inputCls} value={description} onChange={e => setDescription(e.target.value)} disabled={busy} placeholder="Short bio..." />
            </div>

            <div>
              <label className={labelCls}>Profile Image</label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                    <UploadCloud className="w-6 h-6 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-500 break-all">
                      {imageFile ? <span className="font-bold text-[#071726]">{imageFile.name}</span> : existingImageUrl ? 'Image loaded (Click to replace)' : 'Click to upload image (Max 5MB)'}
                    </p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} disabled={busy} />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={isCeo} onChange={e => setIsCeo(e.target.checked)} disabled={busy} className="rounded text-[#071726] focus:ring-[#071726]" />
              <span className="text-sm font-semibold text-slate-900">Make this person the CEO</span>
            </label>

            <button type="submit" className={`w-full mt-4 ${btnPrimary}`} disabled={busy}>
              {busy ? 'Saving...' : editingId ? 'Update Member' : 'Save Member'}
            </button>
          </form>
        </div>

        {/* TEAM LISTING */}
        <div className="lg:col-span-2 space-y-6">
          {/* CEO Listing */}
          <div className={`${cardCls} p-6`}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-600 mb-4 flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Current CEO
            </h3>
            {ceo ? (
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <img src={ceo.image_url} alt={ceo.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-[#071726]">{ceo.name}</p>
                    <p className="text-xs font-semibold text-slate-600">{ceo.role_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEdit(ceo)} disabled={busy} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ceo.id, ceo.name)} disabled={busy} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No CEO added yet.</p>
            )}
          </div>

          {/* Team Listing */}
          <div className={`${cardCls} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#071726] flex items-center gap-2">
                <Users className="h-4 w-4" /> Technical Team
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {team.length} / 10 limit
              </span>
            </div>

            {team.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold text-[#071726] line-clamp-1">{member.name}</p>
                        <p className="text-xs font-semibold text-slate-500 line-clamp-1">{member.role_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEdit(member)} disabled={busy} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name)} disabled={busy} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No team members added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}