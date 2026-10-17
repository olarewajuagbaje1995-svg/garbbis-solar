import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { supabase, publicImageUrl } from '../../lib/supabase'
import { STORAGE_BUCKET } from '../../lib/config'
import { explainError } from '../../lib/errors'
import { btnSecondary } from '../../lib/styles'
import Notice from '../../components/Notice'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_BYTES = 5 * 1024 * 1024

interface Props {
  folder: 'products' | 'services'
  paths: string[]
  onChange: (paths: string[]) => void
  max: number
}

export default function ImageUploader({ folder, paths, onChange, max }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const room = max - paths.length
    const chosen = Array.from(files).slice(0, Math.max(room, 0))
    if (chosen.length === 0) {
      setError(`You can add at most ${max} image${max === 1 ? '' : 's'}. Remove one first to replace it.`)
      return
    }
    setBusy(true)
    const uploaded: string[] = []
    for (const file of chosen) {
      const ext = ALLOWED[file.type]
      if (!ext) {
        setError('Only JPG, PNG or WebP images are allowed.')
        continue
      }
      if (file.size > MAX_BYTES) {
        setError('Each image must be 5 MB or smaller.')
        continue
      }
      const path = `${folder}/${crypto.randomUUID()}.${ext}`
      const { error: err } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: '3600' })
      if (err) setError(explainError(err))
      else uploaded.push(path)
    }
    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
    if (uploaded.length > 0) onChange([...paths, ...uploaded])
  }

  return (
    <div className="space-y-3">
      {error && <Notice variant="error">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        {paths.map((p) => (
          <div key={p} className="relative">
            <img src={publicImageUrl(p) ?? ''} alt="Uploaded" className="h-24 w-24 rounded-lg border border-sand-200 object-cover" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(paths.filter((x) => x !== p))}
              className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {paths.length === 0 && <p className="text-sm text-slate-500">No images yet.</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1}
        className="hidden" onChange={(e) => void onFiles(e.target.files)} />
      <button type="button" className={btnSecondary} disabled={busy || paths.length >= max}
        onClick={() => inputRef.current?.click()}>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {busy ? 'Uploading...' : paths.length > 0 && max === 1 ? 'Remove the image above to replace it' : 'Upload image'}
      </button>
    </div>
  )
}