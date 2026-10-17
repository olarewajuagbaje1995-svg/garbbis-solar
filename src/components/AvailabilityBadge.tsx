import type { Availability } from '../lib/types'
import { AVAILABILITY_LABELS } from '../lib/format'

const colours: Record<Availability, string> = {
  in_stock: 'bg-green-100 text-green-800',
  out_of_stock: 'bg-red-100 text-red-800',
  contact: 'bg-amber-100 text-amber-800',
}

export default function AvailabilityBadge({ value }: { value: Availability }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colours[value]}`}>
      {AVAILABILITY_LABELS[value]}
    </span>
  )
}