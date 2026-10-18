import {
  MessageCircle,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  ArrowRight,
  Zap,
  Sparkles,
  Clock,
  Send,
} from 'lucide-react'

import { BUSINESS } from '../lib/config'
import { usePageTitle } from '../lib/usePageTitle'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { btnWhatsApp, cardCls } from '../lib/styles'
import EnquiryForm from '../components/EnquiryForm'

export default function Contact() {
  usePageTitle(
    'Contact',
    'Contact Garbbis Electrical and Maintenance Limited by phone, WhatsApp or enquiry form.',
  )

  const MAPS_URL = 'https://maps.app.goo.gl/U6P8HKEdVsTjojxS9?g_st=awb'

  const contactCards = [
    {
      title: 'Call our team',
      description: 'Speak with us about your electrical needs.',
      value: BUSINESS.phoneDisplay,
      href: `tel:+${BUSINESS.whatsappNumber}`,
      icon: Phone,
      action: 'Call now',
    },
    {
      title: 'Email us',
      description: 'Send project details or request information.',
      value: BUSINESS.email,
      href: `mailto:${BUSINESS.email}`,
      icon: Mail,
      action: 'Send email',
    },
    {
      title: 'Visit our location',
      description: 'Find us for enquiries and project discussions.',
      value: BUSINESS.address,
      href: MAPS_URL,
      icon: MapPin,
      action: 'View directions',
    },
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 pb-20 text-slate-900">
      {/* HERO */}

      <section className="contact-hero relative isolate overflow-hidden bg-[#071726] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        {/* Animated background lighting */}

        <div className="contact-orb contact-orb-one pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />

        <div className="contact-orb contact-orb-two pointer-events-none absolute -bottom-32 left-[15%] h-72 w-72 rounded-full bg-sky-500/15 blur-3xl sm:h-[30rem] sm:w-[30rem]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.09]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#071726] via-[#071726]/95 to-[#102a43]/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div className="contact-hero-content max-w-3xl">
            <span className="contact-reveal contact-reveal-one mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300 shadow-lg backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-yellow-400" />
              Get in touch with Garbbis
            </span>

            <h1 className="contact-reveal contact-reveal-two text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Let’s power your next
              <span className="contact-gradient-text mt-2 block">
                big project.
              </span>
            </h1>

            <p className="contact-reveal contact-reveal-three mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Need electrical installation, solar solutions, maintenance
              or quality electrical products? Our team is ready to discuss
              your needs and help you take the next step.
            </p>

            <div className="contact-reveal contact-reveal-four mt-8 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl(
                  'Hello Garbbis Electrical and Maintenance Limited, I would like to make an enquiry about your services or products.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnWhatsApp} group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-extrabold shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071726]`}
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#contact-form"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                Send an enquiry
                <Send className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="contact-reveal contact-reveal-four mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Personalised assistance
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-yellow-400" />
                Professional service enquiries
              </span>
            </div>
          </div>

          {/* HERO FEATURE CARD */}

          <div className="contact-reveal contact-reveal-three relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="contact-glow absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-yellow-400/20 via-sky-400/10 to-transparent blur-2xl" />

            <div className="contact-float relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-300">
                  <Zap className="h-7 w-7" />
                </div>

                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  Let’s get started
                </span>
              </div>

              <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
                Your project matters
              </p>

              <h2 className="relative mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
                From the first question to the final connection.
              </h2>

              <p className="relative mt-4 text-sm leading-7 text-slate-300">
                Tell us what you need, share your requirements, and let
                our team help you explore the next steps.
              </p>

              <div className="relative mt-7 space-y-3">
                {[
                  'Electrical and lighting solutions',
                  'Solar and inverter installations',
                  'Repairs and maintenance',
                ].map((item, index) => (
                  <div
                    key={item}
                    className="contact-feature flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition duration-300 hover:translate-x-1 hover:border-yellow-400/40 hover:bg-white/[0.08]"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
                      <ShieldCheck className="h-4 w-4" />
                    </span>

                    <span className="text-xs font-semibold text-slate-200 sm:text-sm">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 border-t border-white/10 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-slate-950">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-white">
                      Have a question?
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Start a conversation with our team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
      </section>

      {/* INTRODUCTION */}

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="contact-section-reveal mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            We’re here to help
          </span>

          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Choose the best way to reach us
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Whether you’re planning a new installation, looking for
            equipment or need technical assistance, contact Garbbis
            through any of the channels below.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {contactCards.map((item, index) => {
            const Icon = item.icon

            return (
              <a
                key={item.title}
                href={item.href}
                target={item.title === 'Visit our location' ? '_blank' : undefined}
                rel={item.title === 'Visit our location' ? 'noopener noreferrer' : undefined}
                className={`contact-card contact-card-${index + 1} group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-2 hover:border-yellow-300 hover:shadow-xl sm:p-7 ${cardCls}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-100/70 transition duration-500 group-hover:scale-150 group-hover:bg-yellow-200/60" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102a43] text-yellow-300 shadow-md transition duration-300 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-amber-600" />
                </div>

                <h3 className="relative mt-6 text-lg font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="relative mt-2 min-h-10 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <p className="relative mt-4 break-words text-sm font-bold leading-6 text-[#102a43]">
                  {item.value}
                </p>

                <div className="relative mt-auto flex items-center gap-2 pt-6 text-xs font-extrabold text-amber-700">
                  {item.action}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* BUSINESS DETAILS AND ENQUIRY FORM */}

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12">
        <div className="grid items-start gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-9">
          {/* BUSINESS INFORMATION */}

          <aside className={`contact-section-reveal relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 ${cardCls}`}>
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-yellow-100/70 blur-3xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                {BUSINESS.name}
              </h2>

              <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-amber-700">
                {BUSINESS.motto}
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Contact our team to discuss your project, equipment
                requirements or maintenance needs.
              </p>

              <div className="my-6 h-px bg-slate-100" />

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-600">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      Business address
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-words text-sm leading-6 text-slate-600 transition hover:text-amber-700 hover:underline"
                    >
                      {BUSINESS.address}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-600">
                    <Phone className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      Phone
                    </p>
                    <a
                      href={`tel:+${BUSINESS.whatsappNumber}`}
                      className="mt-1 inline-block break-words text-sm font-semibold text-slate-600 transition hover:text-amber-700"
                    >
                      {BUSINESS.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-600">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      Email
                    </p>
                    <a
                      href={`mailto:${BUSINESS.email}`}
                      className="mt-1 inline-block break-all text-sm font-semibold text-slate-600 transition hover:text-amber-700"
                    >
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={buildWhatsAppUrl(
                  'Hello Garbbis, I would like to make an enquiry.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnWhatsApp} mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-extrabold shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <MessageCircle className="h-5 w-5" />
                Chat with us on WhatsApp
              </a>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-5 text-slate-500">
                  Send us your enquiry and include the details of your
                  project so we can better understand what you need.
                </p>
              </div>
            </div>
          </aside>

          {/* ENQUIRY FORM */}

          <section
            id="contact-form"
            className={`contact-form-reveal relative scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 lg:p-12 ${cardCls}`}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-100/60 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                    <span className="h-1.5 w-5 rounded-full bg-yellow-400" />
                    Project intake
                  </span>

                  <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Tell us about your project
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                    Share your requirements, preferred timeline and
                    project details. Our enquiry form will help us
                    understand how to assist you.
                  </p>
                </div>

                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50 text-amber-700 sm:flex">
                  <Send className="h-6 w-6" />
                </div>
              </div>

              <div className="my-7 h-px bg-gradient-to-r from-yellow-300 via-slate-200 to-transparent" />

              <EnquiryForm />
            </div>
          </section>
        </div>
      </section>

      {/* ANIMATION STYLES */}

      <style>{`
        .contact-hero {
          background-image:
            radial-gradient(ellipse at 80% 15%, rgba(250, 204, 21, 0.10), transparent 38%),
            linear-gradient(125deg, #071726 0%, #0b2033 48%, #102a43 100%);
          background-size: 150% 150%;
          animation: contactBackgroundMove 16s ease-in-out infinite alternate;
        }

        .contact-gradient-text {
          background: linear-gradient(
            100deg,
            #fde68a 0%,
            #facc15 35%,
            #fff7cc 55%,
            #eab308 75%,
            #fde68a 100%
          );
          background-size: 250% auto;
          color: #facc15;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: contactTextShine 7s ease-in-out infinite;
        }

        .contact-orb-one {
          animation: contactOrbOne 12s ease-in-out infinite alternate;
        }

        .contact-orb-two {
          animation: contactOrbTwo 15s ease-in-out infinite alternate;
        }

        .contact-reveal {
          opacity: 0;
          animation: contactReveal 850ms cubic-bezier(.2,.75,.25,1) forwards;
        }

        .contact-reveal-one { animation-delay: 100ms; }
        .contact-reveal-two { animation-delay: 220ms; }
        .contact-reveal-three { animation-delay: 360ms; }
        .contact-reveal-four { animation-delay: 500ms; }

        .contact-float {
          animation: contactFloat 7s ease-in-out infinite;
        }

        .contact-glow {
          animation: contactGlow 5s ease-in-out infinite alternate;
        }

        .contact-feature {
          opacity: 0;
          animation: contactReveal 700ms ease-out forwards;
        }

        .contact-card {
          opacity: 0;
          animation: contactCardEnter 700ms cubic-bezier(.2,.75,.25,1) forwards;
        }

        .contact-card-1 { animation-delay: 100ms; }
        .contact-card-2 { animation-delay: 220ms; }
        .contact-card-3 { animation-delay: 340ms; }

        .contact-section-reveal {
          animation: contactSectionEnter 800ms ease-out both;
        }

        .contact-form-reveal {
          animation: contactFormEnter 900ms ease-out both;
          animation-delay: 150ms;
        }

        @keyframes contactBackgroundMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        @keyframes contactTextShine {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        @keyframes contactOrbOne {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(-30px, 25px, 0) scale(1.12); }
        }

        @keyframes contactOrbTwo {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(35px, -20px, 0) scale(1.1); }
        }

        @keyframes contactReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 22px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes contactCardEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 28px, 0) scale(.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes contactSectionEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contactFormEnter {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contactFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes contactGlow {
          from { opacity: .55; transform: scale(.98); }
          to { opacity: 1; transform: scale(1.03); }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-hero,
          .contact-gradient-text,
          .contact-orb-one,
          .contact-orb-two,
          .contact-reveal,
          .contact-float,
          .contact-glow,
          .contact-feature,
          .contact-card,
          .contact-section-reveal,
          .contact-form-reveal {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .contact-card,
          .contact-feature {
            opacity: 1 !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  )
}