import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sun,
  Tv,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { usePageTitle } from '../lib/usePageTitle'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { btnPrimary, btnWhatsApp } from '../lib/styles'
import type { Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import Notice from '../components/Notice'

const slides = [
  {
    eyebrow: 'SMART SOLAR • BETTER LIVING',
    title: 'Power your home.',
    accent: 'Live without limits.',
    description:
      'Explore solar panels, inverters and battery systems designed around your home, business and everyday energy needs.',
    primary: 'Explore Solar Solutions',
    primaryTo: '/products',
    secondary: 'Get a Quote',
    secondaryTo: '/contact',
  },
  {
    eyebrow: 'RELIABLE BACKUP • PEACE OF MIND',
    title: 'Keep life moving.',
    accent: 'Even when power fails.',
    description:
      'Discover inverter and battery options to help keep your essential appliances running during power interruptions.',
    primary: 'Explore Equipment',
    primaryTo: '/products',
    secondary: 'Talk to Our Team',
    secondaryTo: '/contact',
  },
  {
    eyebrow: 'INSTALLATION • MAINTENANCE • SUPPORT',
    title: 'Installed with care.',
    accent: 'Built around your needs.',
    description:
      'From site assessments and installation to electrical repairs and maintenance, get help planning your next power project.',
    primary: 'Explore Our Services',
    primaryTo: '/services',
    secondary: 'Request an Assessment',
    secondaryTo: '/contact',
  },
]

const services = [
  {
    icon: Sun,
    title: 'Solar Panel Systems',
    description:
      'Explore solar panel options for generating energy for homes, offices and other properties.',
    number: '01',
  },
  {
    icon: Zap,
    title: 'Hybrid Inverters',
    description:
      'Find inverter solutions to support your appliances and coordinate available power sources.',
    number: '02',
  },
  {
    icon: BatteryCharging,
    title: 'Batteries & Storage',
    description:
      'Explore energy storage options for backup power, based on your loads and runtime requirements.',
    number: '03',
  },
  {
    icon: Waves,
    title: 'Solar Water Pumping',
    description:
      'Discuss solar-powered pumping options for residential, commercial and agricultural needs.',
    number: '04',
  },
  {
    icon: Tv,
    title: 'Home & Business Power',
    description:
      'Plan energy solutions for lighting, TVs, refrigeration and other essential appliances.',
    number: '05',
  },
  {
    icon: Wrench,
    title: 'Repairs & Maintenance',
    description:
      'Get assistance with electrical faults, inverter servicing, system checks and maintenance.',
    number: '06',
  },
]

const solarImage =
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2400&q=85'

const tickerItems = [
  'Smart Solar Solutions',
  'Reliable Backup Power',
  'Inverter & Lithium Storage',
  'Installation & Maintenance',
  'Sabo Road, Ondo State',
]

export default function Home() {
  usePageTitle(
    undefined,
    'Solar panels, inverters, batteries, installation and electrical maintenance from Garbbis Electrical And Maintenance Limited.',
  )

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [heroImageFailed, setHeroImageFailed] = useState(false)

  const [useAc, setUseAc] = useState(false)
  const [usePump, setUsePump] = useState(false)
  const [useFridge, setUseFridge] = useState(true)
  const [useTvLights, setUseTvLights] = useState(true)

  useEffect(() => {
    if (paused) return

    const timer = window.setInterval(() => {
      setCurrentSlide((index) => (index + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [paused])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: queryError } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(4)

        if (queryError) throw queryError

        if (!cancelled) {
          setProducts((data ?? []) as unknown as Product[])
        }
      } catch (queryError) {
        if (!cancelled) setError(explainError(queryError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const slide = slides[currentSlide]

  let recommendation =
    'Start with a load assessment for lighting, TVs and refrigeration.'

  if (useAc && usePump) {
    recommendation =
      'Ask about a higher-capacity system. An engineer should calculate the AC and pump starting loads before sizing.'
  } else if (useAc) {
    recommendation =
      'Discuss an appropriately sized hybrid inverter and battery system. AC capacity and runtime will determine the final size.'
  } else if (usePump) {
    recommendation =
      'Discuss a suitable pump or dedicated inverter solution. Pump rating and starting surge are important.'
  } else if (useFridge && useTvLights) {
    recommendation =
      'A small-to-medium backup system may be suitable. Confirm appliance wattages and desired runtime first.'
  }

  const estimatorMessage = [
    'Hello Garbbis Electrical And Maintenance Limited.',
    'I used the power estimator on your website.',
    `Air conditioner: ${useAc ? 'Yes' : 'No'}`,
    `Water pump: ${usePump ? 'Yes' : 'No'}`,
    `Fridge/freezer: ${useFridge ? 'Yes' : 'No'}`,
    `TVs, lights and phones: ${useTvLights ? 'Yes' : 'No'}`,
    `Initial guidance: ${recommendation}`,
    'Please help assess my actual power requirements and provide a quotation.',
  ].join('\n')

  return (
    <main className="overflow-hidden bg-white pb-12 text-slate-900">

      {/* PREMIUM ANIMATED TICKER */}

      <div className="relative overflow-hidden bg-yellow-400 py-3 text-slate-950 shadow-sm">
        <div className="flex w-max animate-garbbis-ticker whitespace-nowrap">
          {[0, 1, 2, 3].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy > 0}
              className="flex shrink-0 items-center"
            >
              {tickerItems.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="mx-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] sm:mx-8 sm:text-xs"
                >
                  <Zap className="h-4 w-4" />
                  {item}
                  <span className="text-slate-900/40">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CINEMATIC HERO */}

      <section
        aria-label="Garbbis solar and electrical solutions"
        className="garbbis-hero relative isolate min-h-[700px] overflow-hidden bg-[#071726] text-white sm:min-h-[740px] lg:min-h-[790px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false)
          }
        }}
      >
        {/* This dark gradient remains if the photo cannot load. */}

        <div className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_75%_35%,#17466a_0%,#0b263d_42%,#071726_78%)]" />

        {!heroImageFailed && (
          <img
            src={solarImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="garbbis-hero-photo absolute inset-0 -z-20 h-full w-full object-cover"
            onError={() => setHeroImageFailed(true)}
          />
        )}

        {/* Contrast layer for readable text */}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061522]/95 via-[#071726]/80 to-[#071726]/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071726] via-transparent to-[#071726]/35" />

        {/* Animated energy atmosphere */}

        <div className="garbbis-ambient garbbis-ambient-one pointer-events-none absolute -right-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-yellow-400/20 blur-[110px]" />

        <div className="garbbis-ambient garbbis-ambient-two pointer-events-none absolute -bottom-24 left-[35%] -z-10 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-[120px]" />

        <div className="garbbis-grid absolute inset-0 -z-10 opacity-20" />

        <div className="garbbis-light-beam pointer-events-none absolute -inset-y-1/2 left-[60%] -z-10 w-40 rotate-[25deg] bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent blur-2xl" />

        {/* Floating particles */}

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className="garbbis-particle absolute block rounded-full bg-yellow-200"
              style={{
                left: `${(i * 37 + 9) % 100}%`,
                top: `${(i * 29 + 13) % 100}%`,
                width: `${i % 3 === 0 ? 4 : 2}px`,
                height: `${i % 3 === 0 ? 4 : 2}px`,
                animationDelay: `${(i % 7) * -1.3}s`,
                animationDuration: `${9 + (i % 6) * 2}s`,
                opacity: 0.25 + (i % 4) * 0.12,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 pb-28 pt-16 sm:min-h-[740px] sm:px-8 lg:min-h-[790px] lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:pb-32">

          {/* HERO COPY */}

          <div
            key={currentSlide}
            className="garbbis-reveal relative z-10 max-w-3xl"
          >
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-yellow-300/30 bg-slate-950/35 px-4 py-2.5 shadow-lg backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-yellow-200 sm:text-xs">
                {slide.eyebrow}
              </span>
            </div>

            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 sm:text-xs">
              GARBBIS ELECTRICAL AND MAINTENANCE LIMITED
            </p>

            <h1 className="max-w-3xl text-[2.7rem] font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.6rem] xl:text-[5rem]">
              {slide.title}

              <span className="mt-3 block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text pb-2 text-transparent drop-shadow-[0_0_35px_rgba(250,204,21,0.15)]">
                {slide.accent}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {slide.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={slide.primaryTo}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-yellow-400 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-[0_8px_40px_rgba(250,204,21,0.17)] transition duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-[0_12px_45px_rgba(250,204,21,0.3)]"
              >
                {slide.primary}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to={slide.secondaryTo}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/[0.08] px-7 py-4 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-300/60 hover:bg-white/[0.15]"
              >
                {slide.secondary}
                <ChevronRight className="h-5 w-5 text-yellow-300 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-400" />
                Solar and inverter solutions
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-400" />
                Installation and maintenance
              </span>
            </div>
          </div>

          {/* FLOATING VISUAL FEATURE CARD */}

          <div className="relative mx-auto hidden w-full max-w-[430px] lg:block">
            <div className="garbbis-float relative">

              <div className="absolute -inset-8 rounded-[2.5rem] bg-yellow-400/[0.08] blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#0b2134]/70 p-7 shadow-[0_35px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-yellow-300/10" />
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-yellow-300/10" />

                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Energy solutions
                    </p>
                    <h2 className="mt-2 text-xl font-black text-white">
                      Built for everyday life.
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-400/10">
                    <Zap className="h-6 w-6 text-yellow-300" />
                  </div>
                </div>

                <div className="my-7 h-px bg-gradient-to-r from-yellow-400/50 via-white/15 to-transparent" />

                <div className="space-y-5">
                  {[
                    {
                      icon: Sun,
                      title: 'Solar generation',
                      detail: 'Harness energy from the sun',
                      width: '88%',
                    },
                    {
                      icon: BatteryCharging,
                      title: 'Energy storage',
                      detail: 'Plan your backup capacity',
                      width: '72%',
                    },
                    {
                      icon: Zap,
                      title: 'Reliable power',
                      detail: 'Keep essential loads running',
                      width: '94%',
                    },
                  ].map(({ icon: Icon, title, detail, width }, index) => (
                    <div key={title} className="group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-yellow-300 transition group-hover:bg-yellow-400 group-hover:text-slate-950">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white">{title}</p>
                          <p className="mt-1 text-xs text-slate-400">{detail}</p>
                        </div>

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-400/80" />
                      </div>

                      <div className="ml-[52px] mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="garbbis-progress h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-200"
                          style={{
                            width,
                            animationDelay: `${index * 250}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/services"
                  className="mt-7 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white transition hover:border-yellow-300/40 hover:bg-white/[0.08]"
                >
                  Discover our services
                  <ArrowRight className="h-4 w-4 text-yellow-300" />
                </Link>
              </div>

              {/* Floating badge */}

              <div className="absolute -left-7 top-16 flex items-center gap-3 rounded-2xl border border-white/20 bg-[#102a43]/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Smarter energy</p>
                  <p className="mt-1 text-[10px] text-slate-400">Designed around your needs</p>
                </div>
              </div>

              <div className="absolute -bottom-5 right-5 flex items-center gap-2 rounded-xl border border-white/15 bg-[#102a43]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                <span className="text-xs font-bold text-white">Power your possibilities</span>
              </div>
            </div>
          </div>

          {/* MOBILE-ONLY TRUST CARD */}

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-xl">
              <Sun className="h-6 w-6 text-yellow-300" />
              <p className="mt-3 text-sm font-extrabold text-white">Solar solutions</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">Energy for homes and businesses</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-xl">
              <BatteryCharging className="h-6 w-6 text-yellow-300" />
              <p className="mt-3 text-sm font-extrabold text-white">Backup power</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">Inverters and battery storage</p>
            </div>
          </div>

          {/* SLIDER CONTROLS */}

          <div className="absolute bottom-7 left-5 right-5 flex items-center justify-between gap-4 sm:left-8 sm:right-8 lg:bottom-8 lg:left-12 lg:right-12">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-2xl font-black tabular-nums text-yellow-400">
                0{currentSlide + 1}
              </span>
              <span className="h-px w-10 bg-white/30" />
              <span className="text-xs font-semibold text-white/60">
                0{slides.length} — EXPLORE
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((n) => (n - 1 + slides.length) % slides.length)
                }
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/[0.07] text-white backdrop-blur-xl transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === currentSlide ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentSlide
                      ? 'w-9 bg-yellow-400'
                      : 'w-2 bg-white/40 hover:bg-white'
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((n) => (n + 1) % slides.length)
                }
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/[0.07] text-white backdrop-blur-xl transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING VALUE STRIP */}

      <section className="relative z-20 mx-auto -mt-5 max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:grid-cols-3">
          {[
            {
              icon: Sun,
              title: 'Solar Solutions',
              description: 'Explore panels and solar systems',
            },
            {
              icon: Zap,
              title: 'Backup Power',
              description: 'Inverters and battery storage',
            },
            {
              icon: MessageCircle,
              title: 'Expert Guidance',
              description: 'Discuss your energy requirements',
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`group flex items-center gap-4 p-5 transition duration-300 hover:bg-yellow-50/60 sm:p-6 ${
                index < 2 ? 'border-b border-slate-100 sm:border-b-0 sm:border-r' : ''
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-[#102a43] transition duration-300 group-hover:scale-110 group-hover:bg-yellow-400">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-950 sm:text-base">
                  {title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#102a43]" />
            </div>
          ))}
        </div>
      </section>

      {/* POWER ESTIMATOR */}

      <section className="garbbis-estimator relative mt-20 overflow-hidden bg-[#071726] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-blue-500/15 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="garbbis-reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-bold text-yellow-200">
              <Zap className="h-4 w-4" />
              START PLANNING YOUR POWER
            </span>

            <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              What do you need to{' '}
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                keep running?
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Tell us which appliances matter most. Get initial guidance and
              send your requirements directly to our team for a proper
              assessment.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Understand your essential appliance requirements',
                'Discuss suitable inverter and battery options',
                'Request a tailored assessment and quotation',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-yellow-400/15 via-transparent to-sky-400/10 blur-2xl" />

            <div className="relative rounded-[1.7rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-yellow-300">
                    Personal power planner
                  </p>
                  <h3 className="mt-2 text-xl font-black">Select appliances</h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-400/10">
                  <BatteryCharging className="h-6 w-6 text-yellow-300" />
                </div>
              </div>

              <p className="mb-5 mt-2 text-xs leading-5 text-slate-400">
                Select everything you want to power.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Air conditioner', value: useAc, set: setUseAc },
                  { label: 'Water pump', value: usePump, set: setUsePump },
                  {
                    label: 'Refrigerator / freezer',
                    value: useFridge,
                    set: setUseFridge,
                  },
                  {
                    label: 'TVs, lights and phones',
                    value: useTvLights,
                    set: setUseTvLights,
                  },
                ].map((item) => (
                  <label
                    key={item.label}
                    className={`group flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition duration-300 ${
                      item.value
                        ? 'border-yellow-400/70 bg-yellow-400/[0.10]'
                        : 'border-white/10 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-sm font-semibold text-white">
                      {item.label}
                    </span>

                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={(event) => item.set(event.target.checked)}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-yellow-400"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.07] p-4">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-yellow-300">
                  <Zap className="h-4 w-4" />
                  Initial guidance
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  {recommendation}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Final system sizing requires actual appliance wattages,
                  starting loads and your desired backup runtime.
                </p>
              </div>

              <a
                href={buildWhatsAppUrl(estimatorMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnWhatsApp} mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5`}
              >
                <MessageCircle className="h-5 w-5" />
                Send Requirements on WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section className="relative px-5 py-20 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-yellow-100/70 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#102a43]">
              <Zap className="h-4 w-4 text-yellow-600" />
              What we offer
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Energy solutions for{' '}
              <span className="text-[#b88600]">real life.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              From generating clean energy to keeping essential appliances
              running, find solutions built around your property and needs.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, description, number }, index) => (
              <article
                key={title}
                className="garbbis-service-card group relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-500 hover:-translate-y-2 hover:border-yellow-300 hover:shadow-[0_24px_55px_rgba(15,23,42,0.09)] sm:p-7"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 -z-10 h-40 w-40 rounded-full bg-yellow-300/0 blur-3xl transition duration-500 group-hover:bg-yellow-300/20" />

                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 text-[#102a43] transition duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:border-yellow-400 group-hover:from-yellow-300 group-hover:to-yellow-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="text-sm font-black tracking-widest text-slate-200 transition group-hover:text-yellow-500">
                    {number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-extrabold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>

                <Link
                  to="/services"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-[#102a43] transition group-hover:gap-3 group-hover:text-amber-700"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 group-hover:w-full" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}

      <section className="relative overflow-hidden border-y border-slate-200 bg-[#f7f9fc] px-5 py-20 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-yellow-100/80 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl space-y-9">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#102a43]">
                <span className="h-1.5 w-6 rounded-full bg-yellow-400" />
                Our catalogue
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Featured equipment
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
                Discover products for your solar, inverter and backup power
                requirements.
              </p>
            </div>

            <Link
              to="/products"
              className={`${btnPrimary} group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 transition duration-300 hover:-translate-y-1`}
            >
              View all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading && <Loading />}

          {error && <Notice variant="error">{error}</Notice>}

          {!loading && !error && products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
              <BatteryCharging className="mx-auto h-9 w-9 text-slate-400" />
              <h3 className="mt-4 font-extrabold text-slate-900">
                Our equipment catalogue is being updated.
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Contact our team for help finding a suitable solution.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#102a43] hover:text-amber-700"
              >
                Talk to our team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* GLOBAL ANIMATION STYLES */}

      <style>{`
        .garbbis-hero {
          isolation: isolate;
        }

        .garbbis-hero-photo {
          animation: garbbisPhotoReveal 1.3s ease-out both,
                     garbbisPhotoDrift 30s ease-in-out 1.3s infinite alternate;
          transform-origin: center;
        }

        .garbbis-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, black, transparent 95%);
        }

        .garbbis-reveal {
          animation: garbbisReveal 800ms cubic-bezier(.16,1,.3,1) both;
        }

        .garbbis-ambient {
          will-change: transform, opacity;
        }

        .garbbis-ambient-one {
          animation: garbbisGlowOne 11s ease-in-out infinite alternate;
        }

        .garbbis-ambient-two {
          animation: garbbisGlowTwo 13s ease-in-out infinite alternate;
        }

        .garbbis-light-beam {
          animation: garbbisBeam 12s ease-in-out infinite;
        }

        .garbbis-particle {
          box-shadow: 0 0 12px 2px rgba(250,204,21,.4);
          animation: garbbisParticleFloat 12s ease-in-out infinite;
        }

        .garbbis-float {
          animation: garbbisFloat 7s ease-in-out infinite;
        }

        .garbbis-progress {
          transform-origin: left;
          animation: garbbisProgress 1.5s cubic-bezier(.16,1,.3,1) both;
        }

        .garbbis-service-card {
          animation: garbbisReveal 700ms ease-out both;
        }

        .garbbis-estimator {
          isolation: isolate;
        }

        @keyframes garbbisReveal {
          from {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes garbbisPhotoReveal {
          from { opacity: 0; }
          to { opacity: .72; }
        }

        @keyframes garbbisPhotoDrift {
          from { transform: scale(1); }
          to { transform: scale(1.09) translate3d(-1%, 1%, 0); }
        }

        @keyframes garbbisGlowOne {
          from { transform: translate3d(0,0,0) scale(.9); opacity: .55; }
          to { transform: translate3d(-70px,50px,0) scale(1.18); opacity: 1; }
        }

        @keyframes garbbisGlowTwo {
          from { transform: translate3d(0,0,0) scale(1); opacity: .4; }
          to { transform: translate3d(65px,-45px,0) scale(1.2); opacity: .85; }
        }

        @keyframes garbbisBeam {
          0%, 100% { transform: translateX(-100px) rotate(25deg); opacity: .25; }
          50% { transform: translateX(180px) rotate(25deg); opacity: .8; }
        }

        @keyframes garbbisParticleFloat {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(12px,-35px,0); }
        }

        @keyframes garbbisFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes garbbisProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes garbbis-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .animate-garbbis-ticker {
          animation: garbbis-ticker 38s linear infinite;
        }

        .animate-garbbis-ticker:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .garbbis-hero-photo,
          .garbbis-ambient,
          .garbbis-light-beam,
          .garbbis-particle,
          .garbbis-float,
          .garbbis-progress,
          .garbbis-service-card,
          .garbbis-reveal,
          .animate-garbbis-ticker {
            animation: none !important;
          }

          .garbbis-hero-photo {
            transform: none;
          }

          *, *::before, *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  )
}