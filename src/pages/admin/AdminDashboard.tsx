import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, Sun } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { BUSINESS, LOGO_SRC } from '../../lib/config'
import { usePageTitle } from '../../lib/usePageTitle'
import CategoriesAdmin from './CategoriesAdmin'
import EnquiriesAdmin from './EnquiriesAdmin'
import ProductsAdmin from './ProductsAdmin'
import ServicesAdmin from './ServicesAdmin'
import SettingsAdmin from './SettingsAdmin'

type Tab = 'products' | 'services' | 'categories' | 'enquiries' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'services', label: 'Services' },
  { id: 'categories', label: 'Categories' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminDashboard() {
  usePageTitle('Admin dashboard')
  const { session, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('products')
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="min-h-screen bg-sand-100">
      {/* BRAND HERO HEADER BANNER */}
      <header className="border-b border-sand-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 px-4 py-3 text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                {logoFailed ? (
                  <Sun className="h-6 w-6 text-forest-700" />
                ) : (
                  <img src={LOGO_SRC} alt={BUSINESS.shortName} className="h-full w-auto object-contain"
                    onError={() => setLogoFailed(true)} />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Garbbis Portal</span>
                <h1 className="text-sm font-black text-white sm:text-base">{BUSINESS.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">
                View website
              </Link>
              <button type="button" onClick={() => void signOut()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Log out
              </button>
            </div>
          </div>
        </div>

        {/* ADMIN USER BAR & NAVIGATION TABS */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs text-slate-500">
            Logged in as <strong className="text-slate-800">{session?.user.email}</strong>
          </p>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 border-t border-sand-200" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-1.5 ${
                tab === t.id ? 'border-forest-700 text-forest-700 bg-forest-50/50' : 'border-transparent text-slate-600 hover:text-forest-700 hover:bg-slate-50'
              }`}>
              {t.id === 'settings' && <Settings className="h-4 w-4" />}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'services' && <ServicesAdmin />}
        {tab === 'categories' && <CategoriesAdmin />}
        {tab === 'enquiries' && <EnquiriesAdmin />}
        {tab === 'settings' && <SettingsAdmin />}
      </main>
    </div>
  )
}