import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Trash2, Image as ImageIcon, Film, UploadCloud } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { explainError } from '../../lib/errors'
import { btnPrimary, cardCls, inputCls, labelCls } from '../../lib/styles'
import Notice from '../../components/Notice'

interface WorkItem {
  id: string
  title: string
  description: string
  media_type: 'image' | 'video'
  media_url: string
}

export default function AdminWork() {
  const [works, setWorks] = useState<WorkItem[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [file, setFile] = useState<File | null>(null)
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchWorks()
  }, [])

  async function fetchWorks() {
    const { data } = await supabase
      .from('portfolio_works')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setWorks(data)
  }

  async function handleUploadWork(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccess(null)

    if (!title || !file) {
      setError('A title and a file are required.')
      return
    }

    // Check quantity limits
    const currentImages = works.filter(w => w.media_type === 'image').length
    const currentVideos = works.filter(w => w.media_type === 'video').length

    if (mediaType === 'image' && currentImages >= 20) {
      setError('Limit reached: You can only have 20 images. Delete an old one first.')
      return
    }
    if (mediaType === 'video' && currentVideos >= 5) {
      setError('Limit reached: You can only have 5 videos. Delete an old one first.')
      return
    }

    // Check file size limits (5MB for images, 50MB for videos)
    const maxBytes = mediaType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > maxBytes) {
      setError(mediaType === 'image' ? 'Images must be under 5MB.' : 'Videos must be under 50MB.')
      return
    }

    setBusy(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `works/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(fileName, file)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      const { error: insertErr } = await supabase.from('portfolio_works').insert([{
        title,
        description,
        media_type: mediaType,
        media_url: publicUrl,
        file_size_bytes: file.size
      }])

      if (insertErr) throw insertErr

      setSuccess('Portfolio item added successfully!')
      
      setTitle('')
      setDescription('')
      setFile(null)
      const fileInput = document.getElementById('work-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      fetchWorks()
    } catch (err: any) {
      setError(explainError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    
    setBusy(true)
    setError(null)
    const { error: deleteErr } = await supabase.from('portfolio_works').delete().eq('id', id)
    setBusy(false)

    if (deleteErr) {
      setError(explainError(deleteErr))
    } else {
      setSuccess('Item deleted.')
      fetchWorks()
    }
  }

  const videos = works.filter(w => w.media_type === 'video')
  const images = works.filter(w => w.media_type === 'image')

  return (
    <div className="space-y-8">
      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* UPLOAD FORM */}
        <div className={`lg:col-span-1 h-fit ${cardCls} p-6`}>
          <div className="flex items-center gap-3 border-b border-sand-200 pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-forest-800">Add to Portfolio</h2>
              <p className="text-xs text-slate-500">Upload works to show clients</p>
            </div>
          </div>

          <form onSubmit={handleUploadWork} className="space-y-4">
            <div>
              <label className={labelCls}>Type of Media</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaType" checked={mediaType === 'image'} onChange={() => setMediaType('image')} className="text-forest-800 focus:ring-forest-800" disabled={busy} />
                  <span className="text-sm font-semibold text-slate-700">Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaType" checked={mediaType === 'video'} onChange={() => setMediaType('video')} className="text-forest-800 focus:ring-forest-800" disabled={busy} />
                  <span className="text-sm font-semibold text-slate-700">Video</span>
                </label>
              </div>
            </div>

            <div>
              <label className={labelCls}>Title</label>
              <input required type="text" className={inputCls} value={title} onChange={e => setTitle(e.target.value)} disabled={busy} placeholder="e.g. Solar Installation Walkthrough" />
            </div>

            <div>
              <label className={labelCls}>Description (Optional)</label>
              <textarea rows={2} className={inputCls} value={description} onChange={e => setDescription(e.target.value)} disabled={busy} placeholder="Short details about the project..." />
            </div>

            <div>
              <label className={labelCls}>Upload File</label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-sand-300 border-dashed rounded-lg cursor-pointer bg-sand-50 hover:bg-sand-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
                    {mediaType === 'video' ? <Film className="w-6 h-6 text-slate-500 mb-2" /> : <ImageIcon className="w-6 h-6 text-slate-500 mb-2" />}
                    <p className="text-xs text-slate-500 break-all">
                      {file ? <span className="font-bold text-forest-700">{file.name}</span> : `Click to upload ${mediaType} (Max ${mediaType === 'image' ? '5MB' : '50MB'})`}
                    </p>
                  </div>
                  <input id="work-upload" type="file" accept={mediaType === 'image' ? "image/*" : "video/mp4,video/webm"} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} disabled={busy} />
                </label>
              </div>
            </div>

            <button type="submit" className={`w-full mt-4 ${btnPrimary}`} disabled={busy}>
              {busy ? 'Uploading...' : 'Save to Portfolio'}
            </button>
          </form>
        </div>

        {/* GALLERY LISTING */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Videos Section */}
          <div className={`${cardCls} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Film className="h-4 w-4" /> Videos
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {videos.length} / 5 limit
              </span>
            </div>
            
            {videos.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {videos.map((vid) => (
                  <div key={vid.id} className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                    <video src={vid.media_url} className="w-full h-32 object-cover rounded-lg bg-black mb-3" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-forest-900 line-clamp-1">{vid.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{vid.description}</p>
                      </div>
                      <button onClick={() => handleDelete(vid.id)} disabled={busy} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No videos uploaded yet.</p>
            )}
          </div>

          {/* Images Section */}
          <div className={`${cardCls} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Images
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {images.length} / 20 limit
              </span>
            </div>
            
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group bg-sand-50 rounded-xl border border-sand-200 overflow-hidden">
                    <img src={img.media_url} alt={img.title} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      <button onClick={() => handleDelete(img.id)} disabled={busy} className="self-end p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-1">{img.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No images uploaded yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}