import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MessageSquare, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Review {
  id: string
  customer_name: string
  project_type?: string
  comment: string
  rating: number
}

export default function HomeReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    async function fetchHomeReviews() {
      // Fetch only the 3 most recent approved reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (data) setReviews(data)
    }
    fetchHomeReviews()
  }, [])

  // If there are no approved reviews yet, hide the section entirely
  if (reviews.length === 0) return null

  return (
    <section className="py-24 bg-sand-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-section">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-800 mb-4">
            <MessageSquare className="h-3.5 w-3.5" />
            Client Testimonials
          </div>
          <h2 className="text-3xl font-black tracking-tight text-forest-800 sm:text-4xl">
            Trusted by Our Customers
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Quality service. Reliable solutions. See what our clients have to say about working with us.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {reviews.map((r, index) => (
            <article 
              key={r.id} 
              className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between reveal-section hover:-translate-y-1"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed italic text-base">
                  “{r.comment}”
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-sand-100">
                <h4 className="font-black text-forest-900">{r.customer_name}</h4>
                {r.project_type && (
                  <p className="text-sm font-medium text-slate-500 mt-1">{r.project_type}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center reveal-section" style={{ animationDelay: '450ms' }}>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 font-bold text-forest-800 hover:text-green-700 transition-colors group"
          >
            Read more reviews or leave your own
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>

      {/* Animation Styles */}
      <style>{`
        .reveal-section {
          animation: reveal-up 0.7s ease-out both;
          animation-timeline: view();
          animation-range: entry 0% entry 20%;
        }
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}