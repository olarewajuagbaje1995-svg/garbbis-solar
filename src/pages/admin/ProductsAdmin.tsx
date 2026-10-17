import { useCallback, useEffect, useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2, Search, Filter } from 'lucide-react'
import { supabase, publicImageUrl } from '../../lib/supabase'
import { STORAGE_BUCKET } from '../../lib/config'
import { explainError } from '../../lib/errors'
import { AVAILABILITY_LABELS, SLUG_PATTERN, formatNaira, slugify } from '../../lib/format'
import { btnDanger, btnPrimary, btnSecondary, cardCls, inputCls, labelCls } from '../../lib/styles'
import type { Availability, Category, Product, Spec } from '../../lib/types'
import AvailabilityBadge from '../../components/AvailabilityBadge'
import Loading from '../../components/Loading'
import Notice from '../../components/Notice'
import ImageUploader from './ImageUploader'
import RichTextEditor from '../../components/RichTextEditor'

// Extended interface to safely access joined category details without breaking strict TypeScript builds
interface AdminProduct extends Omit<Product, 'categories'> {
  categories?: {
    name?: string
    slug?: string
  } | null
}

interface FormState {
  name: string
  slug: string
  slugTouched: boolean
  description: string
  category_id: string
  price: string
  availability: Availability
  specs: Spec[]
  image_paths: string[]
  is_published: boolean
}

const blank = (categoryId: string): FormState => ({
  name: '',
  slug: '',
  slugTouched: false,
  description: '',
  category_id: categoryId,
  price: '',
  availability: 'contact',
  specs: [],
  image_paths: [],
  is_published: false,
})

export default function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [initialPaths, setInitialPaths] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order').order('name'),
    ])
    if (p.error) setError(explainError(p.error))
    else if (c.error) setError(explainError(c.error))
    else {
      setProducts((p.data ?? []) as unknown as AdminProduct[])
      setCategories((c.data ?? []) as Category[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openNew() {
    if (categories.length === 0) {
      setError('Add at least one category first (Categories tab).')
      return
    }
    setEditingId(null)
    setInitialPaths([])
    setForm(blank(categories[0].id))
    setError(null)
    setSuccess(null)
  }

  function openEdit(p: AdminProduct) {
    setEditingId(p.id)
    setInitialPaths(p.image_paths ?? [])
    setForm({
      name: p.name,
      slug: p.slug,
      slugTouched: true,
      description: p.description ?? '',
      category_id: p.category_id,
      price: p.price_ngn === null ? '' : String(p.price_ngn),
      availability: p.availability,
      specs: p.specifications ?? [],
      image_paths: p.image_paths ?? [],
      is_published: p.is_published,
    })
    setError(null)
    setSuccess(null)
  }

  function patch(changes: Partial<FormState>) {
    setForm((f) => (f ? { ...f, ...changes } : f))
  }

  async function deleteFiles(paths: string[]) {
    if (paths.length > 0) await supabase.storage.from(STORAGE_BUCKET).remove(paths)
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!form || busy) return
    const name = form.name.trim()
    const slug = form.slug.trim()
    if (name.length < 2 || name.length > 150) return setError('Name must be 2 to 150 characters.')
    if (!SLUG_PATTERN.test(slug)) return setError('Slug may use lowercase letters, numbers and single hyphens only.')
    if (!form.category_id) return setError('Choose a category.')
    if (form.description.length > 5000) return setError('Description must be 5000 characters or fewer.')

    let price: number | null = null
    if (form.price.trim() !== '') {
      price = Number(form.price.replace(/,/g, ''))
      if (!Number.isFinite(price) || price < 0) return setError('Price must be a number of naira, 0 or more. Leave blank for "Contact for price".')
    }

    const specs = form.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label || s.value)
    if (specs.some((s) => !s.label || !s.value)) return setError('Each specification needs both a label and a value.')

    setBusy(true)
    setError(null)
    const payload = {
      name,
      slug,
      description: form.description.trim(),
      category_id: form.category_id,
      price_ngn: price,
      availability: form.availability,
      specifications: specs,
      image_paths: form.image_paths,
      is_published: form.is_published,
    }
    const { error: err } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload)
    setBusy(false)
    if (err) return setError(explainError(err))

    await deleteFiles(initialPaths.filter((p) => !form.image_paths.includes(p)))
    setForm(null)
    setEditingId(null)
    setSuccess(editingId ? 'Product updated.' : 'Product added.')
    await load()
  }

  async function togglePublished(p: AdminProduct) {
    setError(null)
    const { error: err } = await supabase.from('products').update({ is_published: !p.is_published }).eq('id', p.id)
    if (err) return setError(explainError(err))
    setSuccess(`"${p.name}" is now ${p.is_published ? 'unpublished' : 'published'}.`)
    await load()
  }

  async function remove(p: AdminProduct) {
    if (!window.confirm(`Permanently delete "${p.name}" and its images? This cannot be undone.`)) return
    setError(null)
    const { error: err } = await supabase.from('products').delete().eq('id', p.id)
    if (err) return setError(explainError(err))
    await deleteFiles(p.image_paths ?? [])
    setSuccess(`"${p.name}" was deleted.`)
    await load()
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const catName = p.categories?.name ?? ''
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            catName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCat = categoryFilter === 'all' || p.category_id === categoryFilter
      return matchesSearch && matchesCat
    })
  }, [products, searchTerm, categoryFilter])

  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.category_id === cat.id).length
    }))
  }, [categories, products])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      {!form && (
        <>
          {/* HORIZONTAL INVENTORY DASHBOARD */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex-shrink-0 w-36 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Products</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{products.length}</p>
            </div>
            {categoryStats.filter(c => c.count > 0).map(cat => (
              <div key={cat.id} className="flex-shrink-0 w-36 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={cat.name}>{cat.name}</p>
                <p className="mt-1 text-3xl font-black text-slate-700">{cat.count}</p>
              </div>
            ))}
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200">
            <button type="button" className={btnPrimary} onClick={openNew}>
              <Plus className="h-4 w-4" /> Add product
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="search" 
                  placeholder="Search products..." 
                  className={`${inputCls} pl-9`} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select 
                  className={`${inputCls} pl-9 font-medium text-slate-700`} 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className={`${cardCls} divide-y divide-sand-200`}>
            {filteredProducts.length === 0 && (
              <p className="p-8 text-center text-sm font-medium text-slate-500">
                No products found matching your criteria.
              </p>
            )}
            {filteredProducts.map((p) => {
              const firstImg = p.image_paths?.[0] ? publicImageUrl(p.image_paths[0]) : null
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-slate-50">
                  <div className="min-w-0 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                      {firstImg ? (
                        <img src={firstImg} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.categories?.name ?? 'Uncategorized'} &middot; {formatNaira(p.price_ngn)} &middot; <span className={p.is_published ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{p.is_published ? 'Published' : 'Unpublished'}</span>
                      </p>
                      <div className="mt-1.5"><AvailabilityBadge value={p.availability} /></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnSecondary} onClick={() => void togglePublished(p)}>
                      {p.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" className={btnSecondary} onClick={() => openEdit(p)}>Edit</button>
                    <button type="button" className={btnDanger} onClick={() => void remove(p)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {form && (
        <form onSubmit={onSave} className={`${cardCls} space-y-4 p-5`} noValidate>
          <h2 className="text-lg font-bold text-forest-800">{editingId ? 'Edit product' : 'Add product'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className={labelCls}>Name *</label>
              <input id="p-name" className={inputCls} value={form.name} disabled={busy}
                onChange={(e) => patch({ name: e.target.value, ...(form.slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
            </div>
            <div>
              <label htmlFor="p-slug" className={labelCls}>Slug (web address) *</label>
              <input id="p-slug" className={inputCls} value={form.slug} disabled={busy}
                onChange={(e) => patch({ slug: e.target.value, slugTouched: true })} />
            </div>
            <div>
              <label htmlFor="p-cat" className={labelCls}>Category *</label>
              <select id="p-cat" className={inputCls} value={form.category_id} disabled={busy}
                onChange={(e) => patch({ category_id: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="p-price" className={labelCls}>Price in naira (blank = Contact for price)</label>
              <input id="p-price" inputMode="decimal" className={inputCls} value={form.price} disabled={busy}
                placeholder="e.g. 450000" onChange={(e) => patch({ price: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-avail" className={labelCls}>Availability</label>
              <select id="p-avail" className={inputCls} value={form.availability} disabled={busy}
                onChange={(e) => patch({ availability: e.target.value as Availability })}>
                {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((k) => (
                  <option key={k} value={k}>{AVAILABILITY_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm font-medium">
              <input type="checkbox" checked={form.is_published} disabled={busy}
                onChange={(e) => patch({ is_published: e.target.checked })} />
              Published (visible on the public website)
            </label>
          </div>
          
          <div>
            <RichTextEditor
              id="p-desc"
              label="Description (with text formatting & colors)"
              value={form.description}
              onChange={(val) => patch({ description: val })}
              rows={5}
              placeholder="Enter product description with custom styling..."
              disabled={busy}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className={labelCls}>Specifications</legend>
            {form.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input aria-label={`Specification ${i + 1} label`} placeholder="Label (e.g. Power)" className={inputCls}
                  value={s.label} onChange={(e) => patch({ specs: form.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                <input aria-label={`Specification ${i + 1} value`} placeholder="Value (e.g. 5 kVA)" className={inputCls}
                  value={s.value} onChange={(e) => patch({ specs: form.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                <button type="button" aria-label="Remove specification" className="rounded-lg border border-sand-200 p-2 text-red-600"
                  onClick={() => patch({ specs: form.specs.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" className={btnSecondary} onClick={() => patch({ specs: [...form.specs, { label: '', value: '' }] })}>
              <Plus className="h-4 w-4" /> Add specification
            </button>
          </fieldset>

          <div>
            <p className={labelCls}>Images (JPG, PNG or WebP, up to 5 MB each, max 10)</p>
            <ImageUploader folder="products" paths={form.image_paths} max={10}
              onChange={(paths) => patch({ image_paths: paths })} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button>
            <button type="button" className={btnSecondary} disabled={busy} onClick={() => { setForm(null); setError(null) }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}