import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Sun,
  Zap,
  CheckCircle2,
  Target,
  HeartHandshake,
  Eye,
  ArrowRight,
  Sparkles,
  Award,
  Leaf,
  Lightbulb,
  Users
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageTitle } from '../lib/usePageTitle'
import { BUSINESS } from '../lib/config'
import { btnPrimary, btnSecondary } from '../lib/styles'

interface TeamMember {
  id: string
  name: string
  role_title: string
  description?: string
  image_url: string
  is_ceo: boolean
}

const missionPoints = [
  'Delivering affordable and sustainable solar energy solutions that empower our customers and protect the environment.',
  'Executing clean, safe, and high-quality electrical wiring that stands the test of time.',
  'Meeting and exceeding customer expectations through reliable, personalized service.',
  'Providing top-notch customer care that reflects our commitment to excellence and integrity.',
  'Redefining maintenance services through smart technologies and proactive, efficient solutions.',
  'Building a future where every home and facility operates efficiently with minimal downtime.',
  'Supplying user-friendly appliances and systems designed for safe, seamless operation and long-term satisfaction.',
]

const coreValues = [
  { letter: 'F', title: 'Faithfulness', desc: 'Remaining committed to our promises and responsibilities.' },
  { letter: 'I', title: 'Integrity', desc: 'Doing the right thing with honesty and professionalism.' },
  { letter: 'R', title: 'Respect', desc: 'Valuing every client, colleague, and partnership.' },
  { letter: 'S', title: 'Service', desc: 'Putting customer needs at the heart of our work.' },
  { letter: 'T', title: 'Transparency', desc: 'Communicating clearly and dealing fairly.' },
  { letter: 'T', title: 'Trustworthy', desc: 'Building lasting relationships through dependable work.' },
  { letter: 'A', title: 'Accountability', desc: 'Taking responsibility for our work and results.' },
  { letter: 'P', title: 'Passion', desc: 'Bringing energy and dedication to every project.' },
  { letter: 'E', title: 'Excellence', desc: 'Pursuing high standards in every solution we deliver.' },
]

const strengths = [
  {
    title: 'Expertise',
    desc: 'Skilled professionals focused on precision, quality, and technical excellence.',
    icon: Award,
  },
  {
    title: 'Reliability',
    desc: 'Timely, efficient service with a strong commitment to safety standards.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer-Centric Approach',
    desc: 'Practical solutions tailored to each customer’s needs and budget.',
    icon: HeartHandshake,
  },
  {
    title: 'Sustainable Practices',
    desc: 'Energy-efficient and environmentally conscious power solutions.',
    icon: Leaf,
  },
  {
    title: 'Trust & Transparency',
    desc: 'Clear communication, fair pricing, and responsible business practices.',
    icon: CheckCircle2,
  },
]

export default function About() {
  usePageTitle(
    'About us',
    `Learn about ${BUSINESS.name}, our FIRST TAPE values, and our mission.`,
  )

  const [ceo, setCeo] = useState<TeamMember | null>(null)
  const [team, setTeam] = useState<TeamMember[]>([])

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true })

      if (data) {
        setCeo(data.find((m) => m.is_ceo) ?? null)
        setTeam(data.filter((m) => !m.is_ceo).slice(0, 10))
      }
    }
    loadMembers()
  }, [])

  return (
    <div className="about-page min-h-screen overflow-hidden bg-slate-50 pb-20">

      {/* ANIMATED HERO */}
      <section className="about-hero relative isolate overflow-hidden bg-[#071726] px-5 py-24 text-center text-white sm:px-8 sm:py-32 lg:py-36">
        <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="hero-orb hero-orb-one absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="hero-orb hero-orb-two absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-yellow-300/15 blur-3xl" />
        <div className="hero-orb hero-orb-three absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="hero-enter inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300 shadow-lg backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4" />
            Who We Are
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <h1 className="hero-enter hero-delay-1 mt-7 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Powering Today.
            <br />
            <span className="hero-gradient-text inline-block pb-2">
              Building Tomorrow.
            </span>
          </h1>

          <p className="hero-enter hero-delay-2 mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {BUSINESS.name} is committed to delivering safe, reliable, and
            high-quality electrical, solar, and maintenance solutions for
            residential, commercial, and industrial clients.
          </p>

          <div className="hero-enter hero-delay-3 mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/services"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-[#071726] shadow-lg shadow-yellow-900/20 transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071726]"
            >
              Explore Our Services
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
            >
              Talk to Our Team
            </Link>
          </div>

          {/* Hero feature strip */}
          <div className="hero-enter hero-delay-3 mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: 'Safety First' },
              { icon: Sun, label: 'Sustainable Energy' },
              { icon: Zap, label: 'Reliable Solutions' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="hero-feature flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-md transition-all duration-300 hover:border-yellow-300/40 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-semibold text-slate-100">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* INTRODUCTION STRIP */}
      <section className="relative z-10 mx-auto -mt-5 max-w-6xl px-4 sm:px-6">
        <div className="about-card grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:grid-cols-3 sm:p-8">
          {[
            {
              icon: ShieldCheck,
              title: 'Safety',
              desc: 'Safety-conscious work and responsible practices.',
            },
            {
              icon: Lightbulb,
              title: 'Innovation',
              desc: 'Modern ideas for everyday power challenges.',
            },
            {
              icon: HeartHandshake,
              title: 'Partnership',
              desc: 'Building trust through service and communication.',
            },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="intro-item flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-yellow-50/50"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-[#071726] transition-transform duration-300 hover:rotate-6 hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#071726]">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        {/* MISSION & VISION */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Mission */}
          <section className="reveal-section space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#071726]">
              <Target className="h-4 w-4 text-yellow-600" />
              Our Purpose
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#071726] sm:text-4xl">
                Our Mission
              </h2>
              <div className="mt-4 h-1.5 w-20 rounded-full bg-yellow-400" />
              <p className="mt-5 text-lg leading-8 text-slate-600">
                At Garbbis Electrical and Maintenance, our mission is to make
                a lasting, positive impact through dependable power solutions,
                excellent service, and continuous improvement.
              </p>
            </div>

            <div className="space-y-3">
              {missionPoints.map((item, index) => (
                <div
                  key={item}
                  className="mission-item group flex gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-200 hover:shadow-lg"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-50 transition-colors duration-300 group-hover:bg-yellow-400">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 transition-colors group-hover:text-[#071726]" />
                  </div>
                  <p className="text-sm font-medium leading-7 text-slate-700 sm:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Vision */}
          <section className="reveal-section space-y-7 lg:sticky lg:top-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5 sm:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-100/40 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-yellow-200/30 blur-2xl" />

              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071726] text-yellow-300 shadow-lg transition-transform duration-500 hover:rotate-6 hover:scale-110">
                  <Eye className="h-7 w-7" />
                </div>

                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Our Future
                </span>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071726] sm:text-4xl">
                  Our Vision
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-700">
                  Our vision is to become Africa’s most trusted and innovative
                  leader in solar energy, electrical solutions, and maintenance
                  services—empowering homes and businesses with sustainable,
                  efficient, and future-ready systems.
                </p>

                <div className="my-7 h-px bg-slate-100" />

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                    <Sun className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#071726]">
                      More Than a Service Provider
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Garbbis Electrical and Maintenance Limited is a trusted
                      partner in building and maintaining safe, efficient, and
                      future-ready infrastructure.
                    </p>
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="group mt-8 inline-flex items-center gap-2 font-bold text-[#071726] transition-colors hover:text-yellow-600"
                >
                  Let’s build something reliable
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Small visual callout */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#0b2134] p-6 text-white shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-[#071726]">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold">Power. Safety. Reliability.</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  The principles behind every solution we deliver.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* TEAM & LEADERSHIP SECTION (Positioned right after Mission & Vision) */}
        {(ceo || team.length > 0) && (
          <section className="reveal-section mt-32">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-yellow-800">
                <Users className="h-4 w-4" />
                Our People
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#071726] sm:text-4xl">
                Leadership That Powers Progress
              </h2>
            </div>

            {/* CEO SPOTLIGHT */}
            {ceo && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-900/5 mb-16 max-w-5xl mx-auto grid md:grid-cols-12 items-start p-8 sm:p-12 gap-10">
                {/* Left Side: Expanded image container */}
                <div className="md:col-span-6 w-full bg-slate-50 rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-slate-100">
                  <img 
                    src={ceo.image_url} 
                    alt={ceo.name} 
                    className="max-h-[520px] w-auto max-w-full object-contain rounded-2xl shadow-sm" 
                  />
                </div>
                
                {/* Right Side: Top-aligned text */}
                <div className="md:col-span-6 flex flex-col justify-start text-left pt-1">
                  <div className="mb-4">
                    <span className="inline-flex text-xs font-black text-[#071726] bg-yellow-300 px-3.5 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-sm">
                      Meet Our CEO
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-[#071726] tracking-tight mb-2">{ceo.name}</h3>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-6">{ceo.role_title}</p>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {ceo.description || "Leading Garbbis Electrical and Maintenance Limited with a vision for sustainable and reliable power solutions."}
                  </p>
                </div>
              </div>
            )}

            {/* TECHNICAL TEAM GRID */}
            {team.length > 0 && (
              <div className="max-w-5xl mx-auto">
                <h3 className="text-xl font-black text-[#071726] mb-8 pb-3 border-b-2 border-slate-200 inline-block">
                  Our Technical Team
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {team.map((member) => (
                    <div key={member.id} className="text-center group">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm border border-slate-200">
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                      <h4 className="font-extrabold text-sm text-[#071726] line-clamp-1">{member.name}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{member.role_title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* CORE VALUES */}
        <section className="reveal-section relative mt-32 overflow-hidden rounded-[2rem] bg-[#071726] p-7 text-white shadow-2xl sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                  <HeartHandshake className="h-4 w-4" />
                  What Guides Us
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Our Core Values
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                  FIRST TAPE is more than a motto. It represents the values that
                  guide how we work, serve customers, and build lasting trust.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-yellow-300/30 px-5 py-4 text-center sm:block">
                <p className="text-3xl font-black text-yellow-300">9</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-300">
                  Core Values
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coreValues.map((value, index) => (
                <article
                  key={value.title}
                  className="value-card group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-white/[0.09] hover:shadow-xl hover:shadow-black/10"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-[#071726] shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                      {value.letter}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white">
                        {value.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {value.desc}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-9 inline-flex items-center gap-3 rounded-full border-2 border-yellow-400/70 px-6 py-3 text-sm font-black tracking-[0.2em] text-yellow-300 transition-all duration-300 hover:bg-yellow-400 hover:text-[#071726]">
              <ShieldCheck className="h-5 w-5" />
              FIRST TAPE
            </div>
          </div>
        </section>

        {/* KEY STRENGTHS */}
        <section className="reveal-section mt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#071726]">
              <Sparkles className="h-4 w-4" />
              The Difference
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#071726] sm:text-4xl">
              Our Key Strengths
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We combine technical capability, customer care, and responsible
              working practices to deliver solutions our clients can depend on.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((strength, index) => {
              const Icon = strength.icon
              return (
                <article
                  key={strength.title}
                  className="strength-card group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-yellow-200 hover:shadow-xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-[#0b2134] transition-all duration-300 group-hover:rotate-6 group-hover:bg-[#071726] group-hover:text-yellow-400">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-[#071726]">
                    {strength.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {strength.desc}
                  </p>

                  <div className="mt-5 h-1 w-10 rounded-full bg-yellow-400 transition-all duration-300 group-hover:w-20" />
                </article>
              )
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="reveal-section relative mt-32 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center sm:px-12 sm:py-16 shadow-lg shadow-slate-900/5">
          <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-yellow-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071726] text-yellow-400 shadow-lg transition-transform duration-500 hover:rotate-6 hover:scale-110">
              <Zap className="h-8 w-8" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-[#071726] sm:text-4xl">
              Ready to Work With Us?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Whether you need electrical work, solar energy solutions, or
              dependable maintenance, our team is ready to discuss your project.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/services"
                className={`group inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 ${btnSecondary}`}
              >
                Explore Our Services
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className={`group inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 ${btnPrimary}`}
              >
                Contact Our Team
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ANIMATION STYLES */}
      <style>{`
        .about-hero {
          background-image:
            radial-gradient(ellipse at 15% 15%, rgba(59, 130, 246, 0.08), transparent 38%),
            radial-gradient(ellipse at 85% 80%, rgba(250, 204, 21, 0.09), transparent 36%);
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 95%);
        }

        .hero-gradient-text {
          background: linear-gradient(100deg, #fef08a 0%, #facc15 45%, #eab308 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient-flow 7s ease-in-out infinite;
        }

        .hero-orb-one { animation: float-orb 12s ease-in-out infinite; }
        .hero-orb-two { animation: float-orb 15s ease-in-out infinite reverse; }
        .hero-orb-three { animation: breathe-orb 8s ease-in-out infinite; }

        .hero-enter {
          opacity: 0;
          animation: hero-enter 0.8s cubic-bezier(.2,.75,.25,1) forwards;
        }

        .hero-delay-1 { animation-delay: 0.12s; }
        .hero-delay-2 { animation-delay: 0.24s; }
        .hero-delay-3 { animation-delay: 0.36s; }

        .reveal-section {
          animation: reveal-up 0.7s ease-out both;
          animation-timeline: view();
          animation-range: entry 0% entry 18%;
        }

        .about-card,
        .mission-item,
        .value-card,
        .strength-card {
          animation: reveal-up 0.65s ease-out both;
        }

        .intro-item {
          animation: reveal-up 0.6s ease-out both;
        }

        @keyframes hero-enter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float-orb {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(18px, -22px, 0); }
        }

        @keyframes breathe-orb {
          0%, 100% { opacity: 0.5; scale: 1; }
          50% { opacity: 1; scale: 1.18; }
        }

        @keyframes gradient-flow {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-page *,
          .about-page *::before,
          .about-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}