import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-forest-700 underline">Go to the home page</Link>
    </div>
  )
}