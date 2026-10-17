import type { ReactNode } from 'react'

type Variant = 'success' | 'error' | 'info'

const styles: Record<Variant, string> = {
  success: 'border-green-300 bg-green-50 text-green-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-amber-300 bg-amber-50 text-amber-900',
}

export default function Notice({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {children}
    </div>
  )
}