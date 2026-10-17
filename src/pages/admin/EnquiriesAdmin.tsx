import { useCallback, useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { formatDate } from '../../lib/format'
import { ENQUIRY_TYPES } from '../../lib/validation'
import { buildWhatsAppUrl, toWhatsAppDigits } from '../../lib/whatsapp'
import { btnDanger, btnSecondary, btnWhatsApp, cardCls, inputCls } from '../../lib/styles'
import type { Enquiry, EnquiryStatus } from '../../lib/types'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'resolved', label: 'Resolved' },
]

export default function EnquiriesAdmin() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all')

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (err) setError(explainError(err))
    else setItems((data ?? []) as Enquiry[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function setStatus(e: Enquiry, status: EnquiryStatus) {
    setError(null)
    const { error: err } = await supabase.from('enquiries').update({ status }).eq('id', e.id)
    if (err) return setError(explainError(err))
    setItems((list) => list.map((x) => (x.id === e.id ? { ...x, status } : x)))
  }

  async function remove(e: Enquiry) {
    if (!window.confirm(`Permanently delete the enquiry from ${e.customer_name}?`)) return
    setError(null)
    const { error: err } = await supabase.from('enquiries').delete().eq('id', e.id)
    if (err) return setError(explainError(err))
    setItems((list) => list.filter((x) => x.id !== e.id))
  }

  if (loading) return <Loading />
  const visible = filter === 'all' ? items : items.filter((i) => i.status === filter)

  return (
    <div className="space-y-4">
      {error && <Notice variant="error">{error}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="enq-filter" className="text-sm font-medium">Show:</label>
        <select id="enq-filter" className={`${inputCls} w-auto`} value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | EnquiryStatus)}>
          <option value="all">All ({items.length})</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label} ({items.filter((i) => i.status === s.value).length})</option>
          ))}
        </select>
        <button type="button" className={btnSecondary} onClick={() => void load()}>Refresh</button>
      </div>

      {visible.length === 0 && <p className="rounded-lg border border-dashed border-sand-200 p-8 text-center text-slate-600">No enquiries to show.</p>}

      {visible.map((e) => (
        <article key={e.id} className={`${cardCls} space-y-2 p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{e.customer_name}</h3>
              <p className="text-xs text-slate-500">{formatDate(e.created_at)} &middot; ref {e.id.slice(0, 8)}</p>
            </div>
            <select aria-label={`Status for ${e.customer_name}`} className={`${inputCls} w-auto`} value={e.status}
              onChange={(ev) => void setStatus(e, ev.target.value as EnquiryStatus)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div><dt className="inline font-medium">Phone: </dt><dd className="inline">{e.phone}</dd></div>
            <div><dt className="inline font-medium">Location: </dt><dd className="inline">{e.location}</dd></div>
            <div><dt className="inline font-medium">Type: </dt><dd className="inline">{ENQUIRY_TYPES.find((t) => t.value === e.enquiry_type)?.label ?? e.enquiry_type}</dd></div>
            {e.item_label && <div><dt className="inline font-medium">Interested in: </dt><dd className="inline">{e.item_label}</dd></div>}
          </dl>
          {e.requirements && <p className="whitespace-pre-line text-sm"><strong>Requirements:</strong> {e.requirements}</p>}
          {e.message && <p className="whitespace-pre-line text-sm"><strong>Message:</strong> {e.message}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <a className={btnWhatsApp} target="_blank" rel="noopener noreferrer"
              href={buildWhatsAppUrl(`Hello ${e.customer_name}, this is Garbbis following up on your enquiry.`, toWhatsAppDigits(e.phone))}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Reply on WhatsApp
            </a>
            <button type="button" className={btnDanger} onClick={() => void remove(e)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  )
}