import { createClient } from '@supabase/supabase-js'
import { STORAGE_BUCKET } from './config'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = createClient(
  url || 'http://localhost:54321',
  key || 'missing-publishable-key',
)

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
}