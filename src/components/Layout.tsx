import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { MessageCircle, Menu, Phone, ShieldCheck, Sun, X, Mail, MapPin, Video } from 'lucide-react'
import { BUSINESS, LOGO_SRC } from '../lib/config'
import { isSupabaseConfigured } from '../lib/supabase'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { btnWhatsApp } from '../lib/styles'
import Notice from './Notice'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us', end: false },
  { to: '/products', label: 'Products', end: false },
  { to: '/services', label: 'Services', end: false },
  { to: '/our-work', label: 'Our Work', end: false },
  { to: '/reviews', label: 'Reviews', end: false },
  { to: '/contact', label: 'Contact', end: false },
]

function Logo() {
  const [failed, setFailed] = useState(false)
  return (
    <Link to="/" className="flex items-center" aria-label={`${BUSINESS.name} home`}>
      {failed ? (
        <Sun className="h-8 w-8 text-[#071726]" aria-hidden="true" />
      ) : (
        <img src={LOGO_SRC} alt={`${BUSINESS.shortName} logo`} className="h-12 w-auto"
          onError={() => setFailed(true)} />
      )}
    </Link>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const MAPS_URL = 'https://maps.app.goo.gl/U6P8HKEdVsTjojxS9?g_st=awb'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-bold tracking-wide transition ${
      isActive ? 'bg-yellow-50 text-[#071726]' : 'text-slate-700 hover:text-[#0b2134]'
    }`

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
        Skip to content
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
            ))}
            <a href={buildWhatsAppUrl('Hello Garbbis, I would like to make an enquiry.')} target="_blank"
              rel="noopener noreferrer" className={`${btnWhatsApp} ml-3 shadow-md`}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          </nav>
          <button type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden" aria-expanded={open}
            aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
              ))}
              <a href={buildWhatsAppUrl('Hello Garbbis, I would like to make an enquiry.')} target="_blank"
                rel="noopener noreferrer" className={`${btnWhatsApp} mt-2`}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
              </a>
            </div>
          </nav>
        )}
      </header>

      {!isSupabaseConfigured && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <Notice variant="error">
            Supabase is not configured. Create the <code>.env</code> file described in Part 3, then restart
            <code> npm run dev</code>.
          </Notice>
        </div>
      )}

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {/* Upgraded Professional Footer */}
      <footer className="bg-[#071726] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2.5 text-white">
                <Sun className="h-7 w-7 text-yellow-400" />
                <span className="font-black text-lg">Garbbis Electrical</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 font-medium">
                {BUSINESS.motto}
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
                <ShieldCheck className="h-4 w-4" /> SAFE &middot; RELIABLE &middot; HIGH-QUALITY
              </div>
            </div>

            <div>
              <p className="font-bold text-white text-base">Quick Links</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition hover:text-yellow-400 hover:translate-x-1 inline-block">
                      &rarr; {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-bold text-white text-base">Our Expertise</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>Solar System Installation &amp; Maintenance</li>
                <li>Inverter &amp; Battery Solutions</li>
                <li>Electrical Wiring &amp; Troubleshooting</li>
                <li>CCTV Installation</li>
                <li>Energy Consultation &amp; System Design</li>
              </ul>
            </div>

            <div className="space-y-4">
              <p className="font-bold text-white text-base">Contact Us</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <a 
                    href={MAPS_URL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition hover:text-yellow-400 hover:underline"
                  >
                    {BUSINESS.address}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-yellow-400 shrink-0" />
                  <a href={`tel:+${BUSINESS.whatsappNumber}`} className="transition hover:text-white">{BUSINESS.phoneDisplay}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-yellow-400 shrink-0" />
                  <a href={`mailto:${BUSINESS.email}`} className="transition hover:text-white">{BUSINESS.email}</a>
                </li>
              </ul>
              <div className="pt-2 flex gap-3">
                <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-yellow-500 hover:text-[#071726] transition text-xs font-bold text-slate-300">
                  Instagram
                </a>
                <a href={BUSINESS.tiktok} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-yellow-500 hover:text-[#071726] transition text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" /> TikTok
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-[#0b2134] pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
            <p className="flex items-center gap-1 font-medium tracking-widest text-yellow-400">
              FIRST TAPE VALUES
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}