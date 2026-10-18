import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Star, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageTitle } from '../lib/usePageTitle'
import { BUSINESS } from '../lib/config'
import { btnPrimary, inputCls, labelCls } from '../lib/styles'

interface Review {
  id: string
  customer_name: string
  project_type?: string
  comment: string
  rating: number
}

export default function Reviews() {
  usePageTitle('Client Reviews', `See what our customers are saying about ${BUSINESS.name}.`)

  const [reviews, setReviews] = useState<Review[]>([])
  
  // Form State
  const [name, setName] = useState('')
  const [project, setProject] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Fetch ONLY approved reviews
  useEffect(() => {
    async function loadReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true) // Only show approved ones!
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
    }
    loadReviews()
  }, [])

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    
    // By default, reviews go into the DB with is_approved = true. 
    // You can manage them in your admin panel immediately.
    const { error } = await supabase.from('reviews').insert([{
      customer_name: name,
      project_type: project,
      comment,
      rating
    }])
    
    setSubmitting(false)
    if (!error) {
      setMsg('Thank you! Your feedback has been submitted successfully.')
      setName('')
      setProject('')
      setComment('')
      setRating(5)
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      {/* STANDARD HERO SECTION */}
      <section className="relative bg-forest-800 py-24 px-5 text-center text-white sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl reveal-section">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-green-300 shadow-lg mb-6">
            <MessageSquare className="h-3.5 w-3.5" />
            Client Testimonials
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            Trusted by Our Customers
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Quality service. Reliable solutions. See what people are saying about our work.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* LEFT: REVIEWS GRID (Takes up 3 columns) */}
          <div className="lg:col-span-3 space-y-6 reveal-section">
            <h2 className="text-2xl font-black text-forest-800 mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Recent Feedback
            </h2>
            
            {reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <article key={r.id} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed italic">
                        “{r.comment}”
                      </p>
                    </div>
                    <div className="mt-8 pt-5 border-t border-sand-100">
                      <h4 className="font-extrabold text-forest-900 text-sm">{r.customer_name}</h4>
                      {r.project_type && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{r.project_type}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center">
                <p className="text-lg font-bold text-forest-800">No reviews yet.</p>
                <p className="text-sm text-slate-500 mt-2">Be the first to leave feedback using the form!</p>
              </div>
            )}
          </div>

          {/* RIGHT: LEAVE A REVIEW FORM (Takes up 2 columns) */}
          <div className="lg:col-span-2 lg:sticky lg:top-8 reveal-section" style={{ animationDelay: '150ms' }}>
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-900/5">
              <h3 className="text-xl font-black text-forest-800 mb-2">Leave a Review</h3>
              <p className="text-sm text-slate-500 mb-6">We value your feedback to help us improve.</p>

              {msg ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center gap-3 border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <div>
                    <p className="font-bold">{msg}</p>
                    <button onClick={() => setMsg(null)} className="text-xs font-bold text-emerald-600 mt-3 hover:underline">
                      Submit another review
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className={labelCls}>Your Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className={inputCls} placeholder="John Doe" disabled={submitting} />
                  </div>

                  <div>
                    <label className={labelCls}>Project / Service (Optional)</label>
                    <input type="text" value={project} onChange={(e) => setProject(e.target.value)}
                      className={inputCls} placeholder="e.g. Solar Installation, Wiring" disabled={submitting} />
                  </div>

                  <div>
                    <label className={labelCls}>Rating</label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                      className={inputCls} disabled={submitting}>
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Your Feedback</label>
                    <textarea required rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
                      className={inputCls} placeholder="Tell us about your experience..." disabled={submitting} />
                  </div>

                  <button type="submit" disabled={submitting} className={`w-full ${btnPrimary}`}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* REVEAL ANIMATION STYLE */}
      <style>{`
        .reveal-section {
          animation: reveal-up 0.7s ease-out both;
          animation-timeline: view();
          animation-range: entry 0% entry 15%;
        }
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}