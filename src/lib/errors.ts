export function explainError(err: unknown): string {
  const e = err as { message?: string; code?: string } | null
  const msg = e?.message ?? ''
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your internet connection and try again.'
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }
  if (/rate_limit/i.test(msg)) {
    return 'Too many enquiries from this phone number recently. Please wait an hour or contact us on WhatsApp.'
  }
  if (/jwt expired/i.test(msg)) {
    return 'Your session has expired. Please log in again.'
  }
  if (e?.code === '42501' || /row-level security|permission denied/i.test(msg)) {
    return 'Permission denied by the database. If you are the admin, log in again; otherwise this action is not allowed.'
  }
  if (e?.code === '23505') {
    return 'That value already exists (for example, a duplicate slug). Choose a different one.'
  }
  if (e?.code === '23503') {
    return 'This item is still used by other records, so it cannot be deleted yet.'
  }
  if (e?.code === '23514') {
    return 'One of the values is outside the allowed limits. Check field lengths and formats.'
  }
  return msg || 'Something went wrong. Please try again.'
}