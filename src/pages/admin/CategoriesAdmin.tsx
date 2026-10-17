import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase, publicImageUrl } from '../../lib/supabase'
import { STORAGE_BUCKET } from '../../lib/config'
import { explainError } from '../../lib/errors'
import { SLUG_PATTERN, slugify } from '../../lib/format'
import { btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, labelCls } from '../../lib/styles'
import type { Category as BaseCategory } from '../../lib/types'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'
import ImageUploader from './ImageUploader'
import { Sun } from 'lucide-react'

// Tell TypeScript about our new database column!
type Category = BaseCategory & {
  image_path?: string | null;
}

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [imagePath, setImagePath] = useState<string>('')
  const [initialImagePath, setInitialImagePath] = useState<string | null>(null)
  
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
    setImagePath(c?.image_path ?? '')
    setInitialImagePath(c?.image_path ?? null)
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
    
    const payload = { 
      name: name.trim(), 
      slug: finalSlug, 
      sort_order: order,
      image_path: imagePath || null
    }
    
    const { error: err } = editing
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert(payload)
      
    setBusy(false)
    if (err) return setError(explainError(err))

    // Cleanup replaced image
    if (editing && initialImagePath && initialImagePath !== imagePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([initialImagePath])
    }

    startEdit(null)
    setSuccess(editing ? 'Category updated.' : 'Category added.')
    await load()
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete the category "${c.name}"? This only works if no product uses it.`)) return
    setError(null)
    const { error: err } = await supabase.from('categories').delete().eq('id', c.id)
    if (err) return setError(explainError(err))
    
    // Cleanup deleted category's image
    if (c.image_path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([c.image_path])
    }
    
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

        <div className="sm:col-span-4 mt-2">
          <p className={labelCls}>Category image (Optional, max 1)</p>
          <ImageUploader 
            folder="products" 
            paths={imagePath ? [imagePath] : []} 
            max={1}
            onChange={(paths) => setImagePath(paths[0] || '')} 
          />
        </div>

        <div className="flex gap-2 sm:col-span-4 pt-2">
          <button type="submit" className={btnPrimary} disabled={busy}>{editing ? 'Save category' : 'Add category'}</button>
          {editing && <button type="button" className={btnSecondary} disabled={busy} onClick={() => startEdit(null)}>Cancel</button>}
        </div>
      </form>

      <div className={`${cardCls} divide-y divide-sand-200`}>
        {items.length === 0 && <p className="p-5 text-sm text-slate-600">No categories yet.</p>}
        {items.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              {/* Thumbnail preview in the admin list */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {c.image_path ? (
                  <img src={publicImageUrl(c.image_path) ?? ''} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <Sun className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{c.name}</p>
                <p className="text-xs font-medium text-slate-500">{c.slug} &middot; order {c.sort_order}</p>
              </div>
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