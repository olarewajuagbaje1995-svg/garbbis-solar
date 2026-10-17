import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { formatNaira } from '../lib/format'
import { usePageTitle } from '../lib/usePageTitle'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { btnWhatsApp, cardCls } from '../lib/styles'
import type { Product } from '../lib/types'
import AvailabilityBadge from '../components/AvailabilityBadge'
import EnquiryForm from '../components/EnquiryForm'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import ProductImage from '../components/ProductImage'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  usePageTitle(product?.name ?? 'Product', product?.description.slice(0, 150))

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setActiveImage(0)
      const { data, error: err } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug ?? '')
        .eq('is_published', true)
        .maybeSingle()
      if (cancelled) return
      if (err) setError(explainError(err))
      else setProduct((data as unknown as Product | null) ?? null)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <Loading label="Loading product..." />
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><Notice variant="error">{error}</Notice></div>
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-2 text-slate-600">It may have been removed or is not available right now.</p>
        <Link to="/products" className="mt-4 inline-block text-forest-700 underline">Back to products</Link>
      </div>
    )
  }

  const waMessage = `Hello Garbbis, I am interested in: ${product.name}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All products
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <ProductImage path={product.image_paths[activeImage]} alt={product.name}
            className="h-72 w-full rounded-2xl sm:h-96" />
          {product.image_paths.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.image_paths.map((path, i) => (
                <button key={path} type="button" onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`} aria-current={i === activeImage}
                  className={`overflow-hidden rounded-lg border-2 ${i === activeImage ? 'border-forest-700' : 'border-transparent'}`}>
                  <ProductImage path={path} alt={`${product.name} thumbnail ${i + 1}`} className="h-16 w-16" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">{product.categories?.name}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-extrabold text-forest-700">{formatNaira(product.price_ngn)}</p>
          <div className="mt-2"><AvailabilityBadge value={product.availability} /></div>
          {product.description && <p className="mt-4 whitespace-pre-line text-slate-700">{product.description}</p>}
          <a href={buildWhatsAppUrl(waMessage)} target="_blank" rel="noopener noreferrer" className={`${btnWhatsApp} mt-5`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask about this on WhatsApp
          </a>

          {product.specifications.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-forest-800">Specifications</h2>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={`${s.label}-${i}`} className="border-b border-sand-200">
                      <th scope="row" className="w-1/3 py-2 pr-3 text-left font-medium text-slate-600">{s.label}</th>
                      <td className="py-2 text-slate-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <section className={`${cardCls} mt-12 p-6`}>
        <h2 className="text-xl font-bold text-forest-800">Enquire about this product</h2>
        <div className="mt-4">
          <EnquiryForm initialItem={{ kind: 'product', id: product.id, name: product.name }} />
        </div>
      </section>
    </div>
  )
}