import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageTitle } from '../lib/usePageTitle'
import { BUSINESS } from '../lib/config'

interface WorkItem {
  id: string
  title: string
  description: string
  media_type: 'image' | 'video'
  media_url: string
}

export default function OurWork() {
  usePageTitle('Our Work', `See recent installations and projects by ${BUSINESS.name}.`)

  const [works, setWorks] = useState<WorkItem[]>([])

  useEffect(() => {
    async function fetchWorks() {
      const { data } = await supabase
        .from('portfolio_works')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setWorks(data)
    }
    fetchWorks()
  }, [])

  const videos = works.filter((w) => w.media_type === 'video').slice(0, 5)
  const images = works.filter((w) => w.media_type === 'image').slice(0, 20)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* STANDARD HERO SECTION */}
      <section className="relative bg-[#071726] py-24 px-5 text-center text-white sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl reveal-section">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-300 mb-4">
            Inside The Project
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            See the work in action.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Real installations. Behind-the-scenes footage. Finished results.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 space-y-20">
        
        {/* VIDEOS SECTION */}
        {videos.length > 0 && (
          <div className="reveal-section">
            <h2 className="text-2xl font-black text-[#071726] mb-8 pb-2 border-b border-slate-200">
              Project Walkthroughs &amp; Videos
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {videos.map((vid) => (
                <article key={vid.id} className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-video bg-black">
                    <video 
                      src={vid.media_url} 
                      controls 
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                  </div>
                  <div className="p-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-800">
                      <Play className="h-5 w-5 ml-1" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#071726]">{vid.title}</h3>
                      {vid.description && (
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* IMAGES GRID SECTION */}
        {images.length > 0 && (
          <div className="reveal-section">
            <h2 className="text-2xl font-black text-[#071726] mb-8 pb-2 border-b border-slate-200">
              Recent Installations
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <article key={img.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="w-full bg-slate-900/5 flex items-center justify-center p-4">
                    <img 
                      src={img.media_url} 
                      alt={img.title} 
                      className="max-h-[360px] w-auto max-w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-5 mt-auto">
                    <h3 className="font-bold text-[#071726] text-lg">{img.title}</h3>
                    {img.description && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {img.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {works.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <p className="text-lg font-bold text-[#071726]">Portfolio updating soon</p>
            <p className="text-sm text-slate-500 mt-2">Check back later to see our latest projects.</p>
          </div>
        )}
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