import { LoaderCircle } from 'lucide-react'

export default function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-600" role="status">
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}