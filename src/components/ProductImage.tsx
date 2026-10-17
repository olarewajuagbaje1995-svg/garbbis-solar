import { Sun } from 'lucide-react'
import { publicImageUrl } from '../lib/supabase'

interface Props {
  path: string | null | undefined
  alt: string
  className?: string
  onClick?: () => void
}

export default function ProductImage({ path, alt, className = '', onClick }: Props) {
  const url = publicImageUrl(path)
  if (!url) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center bg-forest-50 text-forest-500 ${className}`}
        role="img"
        aria-label={`${alt} (no image yet)`}
      >
        <Sun className="h-10 w-10" aria-hidden="true" />
      </div>
    )
  }
  
  // Use object-contain so images show fully instead of being cropped or cut off
  return (
    <img 
      src={url} 
      alt={alt} 
      loading="lazy" 
      onClick={onClick}
      className={`object-contain bg-slate-50 ${className}`} 
    />
  )
}