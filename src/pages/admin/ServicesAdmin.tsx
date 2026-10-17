import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { STORAGE_BUCKET } from '../../lib/config'
import { explainError } from '../../lib/errors'
import { SLUG_PATTERN, slugify } from '../../lib/format'
import { btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, labelCls } from '../../lib/styles'
import type { Service } from '../../lib/types'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'
import ImageUploader from './ImageUploader'
import RichTextEditor from '../../components/RichTextEditor'

interface FormState {
  title: string
  slug: string
  slugTouched: boolean
  summary: string
  description: string
  sort_order: string
  image_paths: string[] // zero or one entry
  is_published: boolean
}

const blank: FormState = {
  title: '',
  slug: '',
  slugTouched: false,
  summary: '',
  description: '',
  sort_order: '0',
  image_paths: [],
  is_published: false,
}

export default function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [initialPath, setInitialPath] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('services').select('*').order('sort_order').order('title')
    if (err) setError(explainError(err))
    else setItems((data ?? []) as Service[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openNew() {
    setEditingId(null)
    setInitialPath(null)
    setForm(blank)
    setError(null)
    setSuccess(null)
  }

  function openEdit(s: Service) {
    setEditingId(s.id)
    setInitialPath(s.image_path)
    setForm({
      title: s.title,
      slug: s.slug,
      slugTouched: true,
      summary: s.summary,
      description: s.description,
      sort_order: String(s.sort_order),
      image_paths: s.image_path ? [s.image_path] : [],
      is_published: s.is_published,
    })
    setError(null)
    setSuccess(null)
  }

  function patch(changes: Partial<FormState>) {
    setForm((f) => (f ? { ...f, ...changes } : f))
  }

  async function deleteFile(path: string | null) {
    if (path) await supabase.storage.from(STORAGE_BUCKET).remove([path])
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!form || busy) return
    const title = form.title.trim()
    const slug = form.slug.trim()
    const summary = form.summary.trim()
    if (title.length < 2 || title.length > 150) return setError('Title must be 2 to 150 characters.')
    if (!SLUG_PATTERN.test(slug)) return setError('Slug may use lowercase letters, numbers and single hyphens only.')
    if (summary.length > 300) return setError('Summary must be 300 characters or fewer.')
    if (form.description.length > 5000) return setError('Description must be 5000 characters or fewer.')
    const order = Number.parseInt(form.sort_order, 10)
    if (Number.isNaN(order)) return setError('Sort order must be a whole number.')

    setBusy(true)
    setError(null)
    const newPath = form.image_paths[0] ?? null
    const payload = {
      title,
      slug,
      summary,
      description: form.description.trim(),
      sort_order: order,
      image_path: newPath,
      is_published: form.is_published,
    }
    const { error: err } = editingId
      ? await supabase.from('services').update(payload).eq('id', editingId)
      : await supabase.from('services').insert(payload)
    setBusy(false)
    if (err) return setError(explainError(err))

    if (initialPath && initialPath !== newPath) await deleteFile(initialPath)
    setForm(null)
    setEditingId(null)
    setSuccess(editingId ? 'Service updated.' : 'Service added.')
    await load()
  }

  async function togglePublished(s: Service) {
    setError(null)
    const { error: err } = await supabase.from('services').update({ is_published: !s.is_published }).eq('id', s.id)
    if (err) return setError(explainError(err))
    setSuccess(`"${s.title}" is now ${s.is_published ? 'unpublished' : 'published'}.`)
    await load()
  }

  async function remove(s: Service) {
    if (!window.confirm(`Permanently delete the service "${s.title}"? This cannot be undone.`)) return
    setError(null)
    const { error: err } = await supabase.from('services').delete().eq('id', s.id)
    if (err) return setError(explainError(err))
    await deleteFile(s.image_path)
    setSuccess(`"${s.title}" was deleted.`)
    await load()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      {!form && (
        <>
          <button type="button" className={btnPrimary} onClick={openNew}><Plus className="h-4 w-4" /> Add service</button>
          <div className={`${cardCls} divide-y divide-sand-200`}>
            {items.length === 0 && <p className="p-5 text-sm text-slate-600">No services yet.</p>}
            {items.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.is_published ? 'Published' : 'Unpublished'} &middot; order {s.sort_order}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnSecondary} onClick={() => void togglePublished(s)}>
                    {s.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => openEdit(s)}>Edit</button>
                  <button type="button" className={btnDanger} onClick={() => void remove(s)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {form && (
        <form onSubmit={onSave} className={`${cardCls} space-y-4 p-5`} noValidate>
          <h2 className="text-lg font-bold text-forest-800">{editingId ? 'Edit service' : 'Add service'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-title" className={labelCls}>Title *</label>
              <input id="s-title" className={inputCls} value={form.title} disabled={busy}
                onChange={(e) => patch({ title: e.target.value, ...(form.slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
            </div>
            <div>
              <label htmlFor="s-slug" className={labelCls}>Slug *</label>
              <input id="s-slug" className={inputCls} value={form.slug} disabled={busy}
                onChange={(e) => patch({ slug: e.target.value, slugTouched: true })} />
            </div>
            <div>
              <label htmlFor="s-order" className={labelCls}>Sort order (lower shows first)</label>
              <input id="s-order" inputMode="numeric" className={inputCls} value={form.sort_order} disabled={busy}
                onChange={(e) => patch({ sort_order: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm font-medium">
              <input type="checkbox" checked={form.is_published} disabled={busy}
                onChange={(e) => patch({ is_published: e.target.checked })} />
              Published
            </label>
          </div>

          <div>
            <RichTextEditor
              id="s-summary"
              label="Short summary (max 300 characters)"
              value={form.summary}
              onChange={(val) => patch({ summary: val })}
              rows={2}
              disabled={busy}
            />
          </div>

          <div>
            <RichTextEditor
              id="s-desc"
              label="Full description (with text formatting & colors)"
              value={form.description}
              onChange={(val) => patch({ description: val })}
              rows={5}
              placeholder="Enter service details with custom styling..."
              disabled={busy}
            />
          </div>

          <div>
            <p className={labelCls}>Image (optional)</p>
            <ImageUploader folder="services" paths={form.image_paths} max={1}
              onChange={(paths) => patch({ image_paths: paths })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving...' : 'Save service'}</button>
            <button type="button" className={btnSecondary} disabled={busy} onClick={() => { setForm(null); setError(null) }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}