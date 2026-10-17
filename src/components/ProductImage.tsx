import { Sun } from 'lucide-react'
import { publicImageUrl } from '../lib/supabase'

interface Props {
  path: string | null | undefined
  alt: string
  className?: string
}

export default function ProductImage({ path, alt, className = '' }: Props) {
  const url = publicImageUrl(path)
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-forest-50 text-forest-500 ${className}`}
        role="img"
        aria-label={`${alt} (no image yet)`}
      >
        <Sun className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }
  return <img src={url} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}