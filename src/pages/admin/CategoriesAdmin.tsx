import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { SLUG_PATTERN, slugify } from '../../lib/format'
import { btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, labelCls } from '../../lib/styles'
import type { Category } from '../../lib/types'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('categories').select('*').order('sort_order').order('name')
    if (err) setError(explainError(err))
    else setItems((data ?? []) as Category[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(c: Category | null) {
    setEditing(c)
    setName(c?.name ?? '')
    setSlug(c?.slug ?? '')
    setSortOrder(String(c?.sort_order ?? 0))
    setError(null)
    setSuccess(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const finalSlug = slug || slugify(name)
    if (name.trim().length < 2 || name.trim().length > 80) return setError('Name must be 2 to 80 characters.')
    if (!SLUG_PATTERN.test(finalSlug)) return setError('Slug may use lowercase letters, numbers and single hyphens only.')
    const order = Number.parseInt(sortOrder, 10)
    if (Number.isNaN(order)) return setError('Sort order must be a whole number.')
    setBusy(true)
    setError(null)
    const payload = { name: name.trim(), slug: finalSlug, sort_order: order }
    const { error: err } = editing
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert(payload)
    setBusy(false)
    if (err) return setError(explainError(err))
    startEdit(null)
    setSuccess(editing ? 'Category updated.' : 'Category added.')
    await load()
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete the category "${c.name}"? This only works if no product uses it.`)) return
    setError(null)
    const { error: err } = await supabase.from('categories').delete().eq('id', c.id)
    if (err) return setError(explainError(err))
    setSuccess('Category deleted.')
    await load()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}
      <form onSubmit={onSubmit} className={`${cardCls} grid gap-4 p-5 sm:grid-cols-4`}>
        <div className="sm:col-span-2">
          <label htmlFor="cat-name" className={labelCls}>Category name *</label>
          <input id="cat-name" className={inputCls} value={name} disabled={busy}
            onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} />
        </div>
        <div>
          <label htmlFor="cat-slug" className={labelCls}>Slug *</label>
          <input id="cat-slug" className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label htmlFor="cat-order" className={labelCls}>Sort order</label>
          <input id="cat-order" inputMode="numeric" className={inputCls} value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)} disabled={busy} />
        </div>
        <div className="flex gap-2 sm:col-span-4">
          <button type="submit" className={btnPrimary} disabled={busy}>{editing ? 'Save category' : 'Add category'}</button>
          {editing && <button type="button" className={btnSecondary} onClick={() => startEdit(null)}>Cancel</button>}
        </div>
      </form>

      <div className={`${cardCls} divide-y divide-sand-200`}>
        {items.length === 0 && <p className="p-5 text-sm text-slate-600">No categories yet.</p>}
        {items.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-slate-500">{c.slug} &middot; order {c.sort_order}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={btnSecondary} onClick={() => startEdit(c)}>Edit</button>
              <button type="button" className={btnDanger} onClick={() => void remove(c)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}