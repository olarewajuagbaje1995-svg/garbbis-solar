import type { Availability } from './types'

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatNaira(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Contact for price'
  return nairaFormatter.format(value)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  in_stock: 'In Stock',
  out_of_stock: 'Out of Stock',
  contact: 'Contact for Availability',
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
}