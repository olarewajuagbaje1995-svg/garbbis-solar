import { useState, useEffect } from 'react'
import { Trash2, MessageSquare, Eye, EyeOff, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { cardCls } from '../../lib/styles'
import Notice from '../../components/Notice'

interface Review {
  id: string
  customer_name: string
  project_type?: string
  comment: string
  rating: number
  is_approved: boolean
  created_at: string
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  async function handleToggleApproval(id: string, currentStatus: boolean) {
    setBusy(true)
    setError(null)
    setSuccess(null)

    const { error: updateErr } = await supabase
      .from('reviews')
      .update({ is_approved: !currentStatus })
      .eq('id', id)

    setBusy(false)

    if (updateErr) {
      setError(explainError(updateErr))
    } else {
      setSuccess(`Review is now ${!currentStatus ? 'Visible' : 'Hidden'}.`)
      fetchReviews()
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return
    
    setBusy(true)
    setError(null)
    const { error: deleteErr } = await supabase.from('reviews').delete().eq('id', id)
    setBusy(false)

    if (deleteErr) {
      setError(explainError(deleteErr))
    } else {
      setSuccess('Review deleted permanently.')
      fetchReviews()
    }
  }

  const approvedCount = reviews.filter(r => r.is_approved).length
  const hiddenCount = reviews.filter(r => !r.is_approved).length

  return (
    <div className="space-y-8">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${cardCls} p-4 text-center`}>
          <p className="text-2xl font-black text-forest-800">{reviews.length}</p>
          <p className="text-xs font-bold uppercase text-slate-500">Total Reviews</p>
        </div>
        <div className={`${cardCls} p-4 text-center border-b-4 border-emerald-500`}>
          <p className="text-2xl font-black text-emerald-700">{approvedCount}</p>
          <p className="text-xs font-bold uppercase text-slate-500">Live on Site</p>
        </div>
        <div className={`${cardCls} p-4 text-center border-b-4 border-amber-500`}>
          <p className="text-2xl font-black text-amber-700">{hiddenCount}</p>
          <p className="text-xs font-bold uppercase text-slate-500">Hidden</p>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className={`${cardCls} p-6`}>
        <div className="flex items-center gap-3 border-b border-sand-200 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-forest-800">Manage Reviews</h2>
            <p className="text-xs text-slate-500">Approve, hide, or delete customer feedback.</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className={`p-5 rounded-2xl border transition-all ${r.is_approved ? 'bg-white border-sand-200' : 'bg-sand-50 border-dashed border-amber-300 opacity-80'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      {!r.is_approved && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Hidden
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-700 text-sm leading-relaxed italic">"{r.comment}"</p>
                    
                    <div>
                      <h4 className="font-bold text-forest-900 text-sm">{r.customer_name}</h4>
                      <p className="text-xs font-medium text-slate-500">{r.project_type || 'General Service'}</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button 
                      onClick={() => handleToggleApproval(r.id, r.is_approved)} 
                      disabled={busy}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${r.is_approved ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                    >
                      {r.is_approved ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Approve</>}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(r.id)} 
                      disabled={busy} 
                      className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-10">No reviews submitted yet.</p>
        )}
      </div>
    </div>
  )
}