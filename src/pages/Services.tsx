import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Wrench,
  Settings,
  Zap,
  ShieldCheck,
  Activity,
  Sun,
  ArrowRight,
  Sparkles,
  Camera,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { usePageTitle } from '../lib/usePageTitle'
import type { Service } from '../lib/types'
import EnquiryForm from '../components/EnquiryForm'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import ServiceCard from '../components/ServiceCard'

const engineeringPillars = [
  {
    title: 'System maintenance',
    description:
      'Preventive checks, performance reviews and corrective work for installed solar and power systems.',
    icon: Settings,
    number: '01',
    color: 'from-amber-400/20 to-yellow-100/5',
  },
  {
    title: 'Technical support',
    description:
      'Structured diagnosis for inverter, battery, solar, CCTV, house wiring and low-voltage issues.',
    icon: Activity,
    number: '02',
    color: 'from-sky-400/20 to-blue-100/5',
  },
  {
    title: 'Site surveys',
    description:
      'Site assessment, load calculations and space mapping before a system recommendation and quotation.',
    icon: ShieldCheck,
    number: '03',
    color: 'from-emerald-400/20 to-green-100/5',
  },
]

const serviceHighlights = [
  { icon: Sun, label: 'Solar & inverter systems' },
  { icon: Camera, label: 'CCTV & security' },
  { icon: Zap, label: 'Electrical installation' },
]

export default function Services() {
  usePageTitle(
    'Services',
    'Solar installation, inverter setup, CCTV, house wiring, repairs and maintenance.',
  )

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: err } = await supabase
          .from('services')
          .select('*')
          .eq('is_published', true)
          .order('sort_order')
          .order('title')

        if (cancelled) return

        if (err) {
          setError(explainError(err))
        } else {
          setServices((data ?? []) as Service[])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(explainError(loadError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  function scrollToServices() {
    document.getElementById('available-services')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function scrollToEnquiry() {
    document.getElementById('service-enquiry')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <main className="garbbis-services min-h-screen overflow-hidden bg-slate-50 pb-16 text-slate-900 sm:pb-20">
      {/* ==================================================
          HERO — ANIMATED TECHNICAL BACKGROUND
      ================================================== */}

      <section className="services-hero relative isolate overflow-hidden bg-[#071726] text-white">
        {/* Background decoration */}
        <div
          aria-hidden="true"
          className="services-grid absolute inset-0"
        />

        <div
          aria-hidden="true"
          className="services-orb services-orb-one absolute rounded-full"
        />

        <div
          aria-hidden="true"
          className="services-orb services-orb-two absolute rounded-full"
        />

        <div
          aria-hidden="true"
          className="services-orb services-orb-three absolute rounded-full"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#071726]/10 via-[#071726]/15 to-[#071726]"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-28">
          {/* Hero copy */}
          <div className="max-w-3xl">
            <div className="hero-reveal hero-delay-1 mb-7 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300 shadow-lg shadow-black/10 backdrop-blur-md sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
              </span>

              <Settings className="h-4 w-4" />
              Garbbis engineering services
            </div>

            <h1 className="hero-reveal hero-delay-2 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Reliable power.
              <span className="hero-gradient-text mt-2 block">
                Smarter solutions.
              </span>
              <span className="mt-2 block text-white">
                Professional service.
              </span>
            </h1>

            <p className="hero-reveal hero-delay-3 mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:mt-7 sm:text-lg sm:leading-8">
              From solar and inverter installations to electrical
              maintenance and CCTV systems, Garbbis helps you keep
              your home and business powered, connected and secure.
            </p>

            <div className="hero-reveal hero-delay-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToServices}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-yellow-400/10 transition duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071726]"
              >
                Explore our services
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToEnquiry}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
              >
                Request a service
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              </button>
            </div>

            <div className="hero-reveal hero-delay-5 mt-9 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-xs text-slate-300 sm:gap-x-7">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                Professional support
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                Tailored solutions
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                Service enquiries
              </span>
            </div>
          </div>

          {/* Animated engineering visual */}
          <div className="hero-reveal hero-delay-3 relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-full bg-sky-400/10 blur-3xl"
            />

            <div className="services-visual relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/[0.11] via-white/[0.04] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
                    Engineering overview
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Powering everyday life
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="relative my-7 flex items-center justify-center py-5">
                <div className="services-ring services-ring-one absolute h-48 w-48 rounded-full border border-yellow-400/20 sm:h-56 sm:w-56" />

                <div className="services-ring services-ring-two absolute h-36 w-36 rounded-full border border-sky-300/20 sm:h-44 sm:w-44" />

                <div className="services-center relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-yellow-300/30 bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 shadow-2xl shadow-yellow-400/20 sm:h-32 sm:w-32">
                  <div className="absolute inset-2 rounded-[1.5rem] border border-white/40" />
                  <Zap className="relative h-14 w-14 sm:h-16 sm:w-16" />
                </div>

                <div className="services-float services-float-left absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#102a43] text-yellow-300 shadow-xl sm:left-3 sm:h-14 sm:w-14">
                  <Sun className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <div className="services-float services-float-right absolute right-0 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#102a43] text-sky-300 shadow-xl sm:right-3 sm:h-14 sm:w-14">
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <div className="services-float services-float-bottom absolute bottom-0 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#102a43] text-emerald-300 shadow-xl sm:h-14 sm:w-14">
                  <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {serviceHighlights.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="hero-highlight flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 transition duration-300 hover:border-yellow-400/30 hover:bg-white/[0.08] sm:flex-col sm:items-start"
                      style={
                        {
                          '--highlight-delay': `${index * 120}ms`,
                        } as CSSProperties
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0 text-yellow-300" />

                      <span className="text-xs font-bold leading-5 text-slate-200">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <p className="text-xs leading-5 text-slate-300">
                  Tell us what you need. We’ll help you identify the
                  next steps for your project.
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-5 -right-3 -z-10 h-24 w-24 rounded-full bg-yellow-400/20 blur-3xl" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
        />
      </section>

      {/* ==================================================
          CORE ENGINEERING PILLARS
      ================================================== */}

      <section className="relative z-10 mx-auto -mt-5 max-w-7xl px-5 sm:-mt-8 sm:px-8 lg:px-12">
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {engineeringPillars.map((pillar, index) => {
            const Icon = pillar.icon

            return (
              <article
                key={pillar.title}
                className="services-pillar group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/[0.04] transition duration-500 hover:-translate-y-2 hover:border-yellow-400/70 hover:shadow-2xl hover:shadow-slate-900/[0.08] sm:p-7"
                style={
                  {
                    '--card-delay': `${index * 130}ms`,
                  } as CSSProperties
                }
              >
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${pillar.color} opacity-70 blur-2xl transition duration-500 group-hover:scale-150`}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-yellow-300 shadow-lg transition duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-[#102a43]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-black tracking-[0.15em] text-slate-300 transition group-hover:text-amber-500">
                    {pillar.number}
                  </span>
                </div>

                <h2 className="relative mt-6 text-xl font-extrabold tracking-tight text-slate-950">
                  {pillar.title}
                </h2>

                <p className="relative mt-3 text-sm leading-7 text-slate-600">
                  {pillar.description}
                </p>

                <div className="mt-5 h-1 w-9 rounded-full bg-yellow-400 transition-all duration-500 group-hover:w-16" />
              </article>
            )
          })}
        </div>
      </section>

      {/* ==================================================
          SERVICE CATALOGUE
      ================================================== */}

      <section
        id="available-services"
        className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12"
      >
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800 sm:text-xs">
            <Wrench className="h-4 w-4" />
            Professional expertise
          </div>

          <h2 className="services-heading-reveal mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Services built around{' '}
            <span className="hero-gradient-text-dark">
              your needs.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Explore our electrical, solar, installation and
            maintenance services. Choose a service to learn more,
            then submit an enquiry for your project.
          </p>

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-yellow-400" />
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loading label="Loading services..." />
          </div>
        )}

        {error && <Notice variant="error">{error}</Notice>}

        {!loading && !error && services.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="services-empty-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-yellow-300">
              <Wrench className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              Our services catalogue is being updated.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
              You can still contact us through the enquiry form below.
              Tell us about your project or maintenance needs.
            </p>

            <button
              type="button"
              onClick={scrollToEnquiry}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-yellow-300"
            >
              Request a service
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Explore our available services.
              </p>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {services.length}{' '}
                {services.length === 1 ? 'service' : 'services'} listed
              </span>
            </div>

            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="service-card-reveal min-w-0"
                  style={
                    {
                      '--card-delay': `${(index % 6) * 90}ms`,
                    } as CSSProperties
                  }
                >
                  <div className="h-full transition duration-300 hover:-translate-y-1">
                    <ServiceCard service={service} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ==================================================
          ENQUIRY FORM
      ================================================== */}

      <section
        id="service-enquiry"
        className="scroll-mt-24 relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"
      >
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#071726] shadow-2xl shadow-slate-900/10">
          <div
            aria-hidden="true"
            className="services-grid absolute inset-0 opacity-60"
          />

          <div
            aria-hidden="true"
            className="services-orb services-orb-one absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-50"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#102a43]/50 via-transparent to-[#071726]/70"
          />

          <div className="relative z-10 grid gap-10 p-5 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:p-12">
            {/* Form introduction */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300 sm:text-xs">
                <Sparkles className="h-4 w-4" />
                Engineering intake
              </div>

              <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Let’s get your project
                <span className="hero-gradient-text mt-2 block">
                  moving forward.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                Tell us what you need, where the work will take place,
                and your preferred timeline. Our team can review your
                request and advise you on the next steps.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Describe the service you need',
                  'Share your project requirements',
                  'Let our team review your enquiry',
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-200"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-xs font-black text-yellow-300">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-yellow-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Every project starts with understanding your needs.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Provide accurate details so your enquiry can be
                    reviewed appropriately.
                  </p>
                </div>
              </div>
            </div>

            {/* Existing enquiry form */}
            <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8 lg:p-9">
              <div className="mb-7">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                  Service request
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Schedule a service
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Complete the form below to tell us about your
                  installation, repair or maintenance requirements.
                </p>
              </div>

              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ANIMATION STYLES
      ================================================== */}

      <style>{`
        .garbbis-services {
          --garbbis-yellow: #facc15;
          --garbbis-navy: #071726;
        }

        .services-hero {
          isolation: isolate;
        }

        /* Technical grid background */
        .services-grid {
          background-image:
            linear-gradient(
              rgba(148, 163, 184, 0.065) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148, 163, 184, 0.065) 1px,
              transparent 1px
            );
          background-size: 44px 44px;
          -webkit-mask-image: linear-gradient(
            to bottom,
            black,
            black 65%,
            transparent
          );
          mask-image: linear-gradient(
            to bottom,
            black,
            black 65%,
            transparent
          );
          animation: servicesGridDrift 35s linear infinite;
        }

        /* Ambient background lights */
        .services-orb {
          pointer-events: none;
          filter: blur(75px);
          opacity: 0.25;
          will-change: transform;
        }

        .services-orb-one {
          top: 5%;
          right: 5%;
          width: 320px;
          height: 320px;
          background: #0ea5e9;
          animation: servicesOrbFloat 12s ease-in-out infinite;
        }

        .services-orb-two {
          bottom: 0;
          left: 10%;
          width: 280px;
          height: 280px;
          background: #eab308;
          animation: servicesOrbFloat 15s ease-in-out infinite reverse;
        }

        .services-orb-three {
          top: 45%;
          left: 42%;
          width: 200px;
          height: 200px;
          background: #0d9488;
          animation: servicesOrbFloat 17s ease-in-out infinite;
        }

        /* Staggered hero text reveal */
        .hero-reveal {
          opacity: 0;
          animation: servicesReveal 850ms cubic-bezier(
            0.2,
            0.75,
            0.25,
            1
          ) forwards;
        }

        .hero-delay-1 {
          animation-delay: 80ms;
        }

        .hero-delay-2 {
          animation-delay: 200ms;
        }

        .hero-delay-3 {
          animation-delay: 340ms;
        }

        .hero-delay-4 {
          animation-delay: 470ms;
        }

        .hero-delay-5 {
          animation-delay: 590ms;
        }

        .hero-gradient-text {
          background: linear-gradient(
            100deg,
            #fde68a 0%,
            #facc15 35%,
            #fff7cc 55%,
            #fbbf24 75%,
            #fde68a 100%
          );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: servicesTextShine 7s ease-in-out infinite;
        }

        .hero-gradient-text-dark {
          background: linear-gradient(
            100deg,
            #b45309,
            #eab308,
            #f59e0b,
            #b45309
          );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: servicesTextShine 7s ease-in-out infinite;
        }

        /* Engineering visual */
        .services-visual {
          animation: servicesPanelFloat 7s ease-in-out infinite;
        }

        .services-ring {
          animation: servicesRingRotate 28s linear infinite;
        }

        .services-ring-two {
          animation-direction: reverse;
          border-style: dashed;
        }

        .services-center {
          animation: servicesCenterPulse 4s ease-in-out infinite;
        }

        .services-float {
          animation: servicesIconFloat 4.5s ease-in-out infinite;
        }

        .services-float-right {
          animation-delay: -1.5s;
        }

        .services-float-bottom {
          animation-delay: -2.8s;
        }

        .hero-highlight {
          opacity: 0;
          animation: servicesReveal 700ms ease-out forwards;
          animation-delay: calc(600ms + var(--highlight-delay, 0ms));
        }

        /* Animated feature cards */
        .services-pillar {
          animation: servicesCardReveal 750ms cubic-bezier(
            0.2,
            0.75,
            0.25,
            1
          ) both;
          animation-delay: var(--card-delay, 0ms);
        }

        .service-card-reveal {
          animation: servicesCardReveal 650ms cubic-bezier(
            0.2,
            0.75,
            0.25,
            1
          ) both;
          animation-delay: var(--card-delay, 0ms);
        }

        .services-heading-reveal {
          animation: servicesReveal 800ms ease-out both;
        }

        .services-empty-icon {
          animation: servicesCenterPulse 3.5s ease-in-out infinite;
        }

        /* Keyframes */
        @keyframes servicesReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes servicesCardReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 28px, 0) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes servicesTextShine {
          0%, 100% {
            background-position: 0% center;
          }

          50% {
            background-position: 100% center;
          }
        }

        @keyframes servicesOrbFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-25px, 20px, 0) scale(1.12);
          }
        }

        @keyframes servicesPanelFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -7px, 0);
          }
        }

        @keyframes servicesRingRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes servicesCenterPulse {
          0%, 100% {
            box-shadow: 0 0 25px rgba(250, 204, 21, 0.12);
          }

          50% {
            box-shadow: 0 0 48px rgba(250, 204, 21, 0.3);
          }
        }

        @keyframes servicesIconFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes servicesGridDrift {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 44px 44px;
          }
        }

        /* Mobile optimization */
        @media (max-width: 640px) {
          .services-orb-one {
            width: 220px;
            height: 220px;
          }

          .services-orb-two {
            width: 180px;
            height: 180px;
          }

          .services-grid {
            background-size: 34px 34px;
          }

          .services-visual {
            animation-duration: 9s;
          }
        }

        /* Respect reduced-motion accessibility preferences */
        @media (prefers-reduced-motion: reduce) {
          .garbbis-services *,
          .garbbis-services *::before,
          .garbbis-services *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .hero-reveal,
          .hero-highlight,
          .services-pillar,
          .service-card-reveal,
          .services-heading-reveal {
            opacity: 1 !important;
            transform: none !important;
          }

          .services-grid {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}