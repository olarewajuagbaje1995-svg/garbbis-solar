import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  SlidersHorizontal,
  X,
  Zap,
  RotateCcw,
  PackageSearch,
  Sparkles,
  Check,
  Image as ImageIcon,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { usePageTitle } from '../lib/usePageTitle'
import { buildWhatsAppUrl } from '../lib/whatsapp'
import { btnWhatsApp } from '../lib/styles'
import type { Category, Product } from '../lib/types'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import Notice from '../components/Notice'

/* -------------------------------------------------------
   CATEGORY IMAGE HELPERS

   Use real product/lifestyle photography for Outdoor Lights and
   Solar Accessories instead of illustrated placeholder graphics.
------------------------------------------------------- */

const outdoorLightImage =
  'https://vakkerlight.com/cdn/shop/files/Cylindrical_Outdoor_Wall_Light__19.jpg?v=1712664510&width=1200'
const outdoorLightImageAlternate =
  'https://www.kanlux.com/storage/products/aranz/big/46205_3.jpg'
const solarAccessoriesImage =
  'https://www.sustainable.co.za/cdn/shop/products/victron_kit_1.jpg?v=1634321992'
const solarAccessoriesImageAlternate =
  'https://callidus.shop/cdn/shop/products/KIT362305WNEW.jpg?v=1764850779&width=1000'

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getCategoryKey(name = '', slug = '') {
  const normalizedSlug = normalizeSlug(slug)
  const normalizedName = normalizeSlug(name)
  const combined = `${normalizedSlug} ${normalizedName}`

  if (
    combined.includes('outdoor') &&
    (combined.includes('light') || combined.includes('lighting'))
  ) return 'outdoor-lights'

  if (
    combined.includes('indoor') &&
    (combined.includes('light') || combined.includes('lighting'))
  ) return 'indoor-lights'

  if (combined.includes('chandelier')) return 'chandeliers'

  if (combined.includes('switch') || combined.includes('socket')) {
    return 'switches-sockets'
  }

  if (combined.includes('solar') && combined.includes('accessor')) {
    return 'solar-accessories'
  }

  if (
    combined.includes('solar') &&
    (combined.includes('panel') || combined.includes('energy'))
  ) return 'solar-panels'

  if (combined.includes('inverter')) return 'inverters'
  if (combined.includes('batter') || combined.includes('battery')) return 'batteries'
  if (combined.includes('cctv') || combined.includes('security-camera')) return 'cctv'

  return normalizedSlug || normalizedName
}

const defaultCategories = [
  {
    id: 'cat-1',
    name: 'Chandeliers',
    slug: 'chandeliers',
    sort_order: 1,
    img: 'https://www.regencychandeliers.co.uk/images/product/1483/4/952x870-Regency_Brass_Arm_Chandelier8.jpg',
  },
  {
    id: 'cat-2',
    name: 'Indoor Lights',
    slug: 'indoor-lights',
    sort_order: 2,
    img: 'https://vakkerlight.com/cdn/shop/products/Sunny_LED_Spotlights_12.jpg?v=1687765390&width=1500',
  },
  {
    id: 'cat-3',
    name: 'Outdoor Lights',
    slug: 'outdoor-lights',
    sort_order: 3,
    img: outdoorLightImage,
  },
  {
    id: 'cat-9',
    name: 'Solar Accessories',
    slug: 'solar-accessories',
    sort_order: 6,
    img: solarAccessoriesImage,
  },
  {
    id: 'cat-4',
    name: 'Switches & Sockets',
    slug: 'switches-sockets',
    sort_order: 4,
    img: 'https://image.made-in-china.com/2f0j00nKMTlBbCLEWs/Factory-Made-Electrical-UK-Standard-Wall-Switch.jpg',
  },
  {
    id: 'cat-5',
    name: 'Solar Panels',
    slug: 'solar-panels',
    sort_order: 5,
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'cat-6',
    name: 'Inverters',
    slug: 'inverters',
    sort_order: 7,
    img: 'https://acdn-us.mitiendanube.com/stores/003/582/147/products/8kw-bdc4513eb7fff146e917424027353474-640-0.webp',
  },
  {
    id: 'cat-7',
    name: 'Batteries',
    slug: 'batteries',
    sort_order: 8,
    img: 'https://web.jood.com.iq/mediafiles/products/cc0745fc-3433-4cf9-baad-51ff4754d7fd.png',
  },
  {
    id: 'cat-8',
    name: 'CCTV',
    slug: 'cctv',
    sort_order: 9,
    img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=85',
  },
] as const

type ShopCategory = Category & {
  img?: string
  sort_order?: number | null
}

const categoryFallbackColors: Record<string, [string, string]> = {
  chandeliers: ['#422006', '#fbbf24'],
  'indoor-lights': ['#172554', '#fde68a'],
  'outdoor-lights': ['#0f172a', '#fbbf24'],
  'switches-sockets': ['#334155', '#e2e8f0'],
  'solar-panels': ['#082f49', '#38bdf8'],
  'solar-accessories': ['#082f49', '#38bdf8'],
  inverters: ['#1e293b', '#cbd5e1'],
  batteries: ['#064e3b', '#6ee7b7'],
  cctv: ['#18181b', '#a1a1aa'],
}

function createCategoryFallback(name: string, slug: string) {
  const key = getCategoryKey(name, slug)

  /*
   * Always use the purpose-built local illustration for
   * Outdoor Lights, including when another image fails.
   */
  if (key === 'outdoor-lights') {
    return outdoorLightImage
  }

  const [background, accent] =
    categoryFallbackColors[key] ?? ['#102a43', '#facc15']

  const safeName = name.replace(/[<>&"']/g, '').slice(0, 32)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0%" stop-color="${accent}" stop-opacity=".3"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="600" height="400" fill="url(#bg)"/>
      <circle cx="470" cy="100" r="190" fill="url(#glow)"/>
      <circle cx="110" cy="330" r="160" fill="url(#glow)"/>

      <rect x="36" y="36" width="528" height="328"
        rx="24" fill="none" stroke="${accent}"
        stroke-opacity=".35" stroke-width="2"/>

      <circle cx="300" cy="150" r="42"
        fill="${accent}" fill-opacity=".13"
        stroke="${accent}" stroke-opacity=".8" stroke-width="2"/>

      <path d="M300 119L300 181M269 150L331 150"
        stroke="${accent}" stroke-width="5"
        stroke-linecap="round"/>

      <text x="300" y="245" fill="#ffffff"
        font-size="27" font-family="Arial,Helvetica,sans-serif"
        font-weight="700" text-anchor="middle">
        ${safeName}
      </text>

      <text x="300" y="278" fill="${accent}"
        font-size="13" font-family="Arial,Helvetica,sans-serif"
        letter-spacing="3" text-anchor="middle">
        GARBBIS ELECTRICAL
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default function Products() {
  usePageTitle(
    'Products',
    'Shop solar panels, chandeliers, indoor and outdoor lights, switches, sockets, inverters and electrical products from Garbbis.',
  )

  const [params, setParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [dbCategories, setDbCategories] = useState<Category[]>([])

  const [searchInput, setSearchInput] = useState(params.get('q') ?? '')
  const [searchQuery, setSearchQuery] = useState(params.get('q') ?? '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [suggestAc, setSuggestAc] = useState(false)
  const [suggestFridge, setSuggestFridge] = useState(false)
  const [suggestTv, setSuggestTv] = useState(false)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('name')

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')
  const [filterError, setFilterError] = useState('')

  const activeCategory =
    params.get('category') ??
    params.get('subcat') ??
    'all'

  /* Keep search synchronized with URL navigation. */

  useEffect(() => {
    const query = params.get('q') ?? ''
    setSearchInput(query)
    setSearchQuery(query)
  }, [params])

  /* Load products and categories from Supabase. */

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [productResult, categoryResult] = await Promise.all([
          supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('is_published', true)
            .order('name'),

          supabase
            .from('categories')
            .select('*')
            .order('sort_order')
            .order('name'),
        ])

        if (cancelled) return

        if (productResult.error) throw productResult.error
        if (categoryResult.error) throw categoryResult.error

        setProducts(
          (productResult.data ?? []) as unknown as Product[],
        )

        setDbCategories(
          (categoryResult.data ?? []) as Category[],
        )
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

  /* Combine database categories with preset images. */

  const categories: ShopCategory[] = useMemo(() => {
    const source: ShopCategory[] =
      dbCategories.length > 0
        ? (dbCategories as ShopCategory[])
        : (defaultCategories as unknown as ShopCategory[])

    const result: ShopCategory[] = source.map((category): ShopCategory => {
      const name = category.name ?? 'Electrical Products'
      const slug = category.slug ?? ''
      const key = getCategoryKey(name, slug)

      const preset = defaultCategories.find(
        (item) => item.slug === key,
      )

      /* Use the selected real photo rather than a generated graphic. */
      let image: string

      if (key === 'outdoor-lights') {
        image = outdoorLightImage
      } else if (key === 'solar-accessories') {
        image = solarAccessoriesImage
      } else {
        image =
          preset?.img ||
          category.img ||
          createCategoryFallback(name, slug)
      }

      return {
        ...category,
        img: image,
      }
    })

    /*
     * Ensure the Outdoor Lights category still appears if it
     * has not been created in Supabase yet.
     */
    const hasOutdoor = result.some(
      (category) =>
        getCategoryKey(
          category.name ?? '',
          category.slug ?? '',
        ) === 'outdoor-lights',
    )

    if (!hasOutdoor) {
      const outdoorPreset = defaultCategories.find(
        (item) => item.slug === 'outdoor-lights',
      )

      if (outdoorPreset) {
        result.push({
          ...outdoorPreset,
          img: outdoorLightImage,
        } as unknown as ShopCategory)
      }
    }

    const hasSolarAccessories = result.some(
      (category) =>
        getCategoryKey(
          category.name ?? '',
          category.slug ?? '',
        ) === 'solar-accessories',
    )

    if (!hasSolarAccessories) {
      const solarAccessoriesPreset = defaultCategories.find(
        (item) => item.slug === 'solar-accessories',
      )

      if (solarAccessoriesPreset) {
        result.push({
          ...solarAccessoriesPreset,
          img: solarAccessoriesImage,
        } as unknown as ShopCategory)
      }
    }

    return result.sort((a, b) => {
      const orderA = a.sort_order ?? 999
      const orderB = b.sort_order ?? 999

      return (
        orderA - orderB ||
        (a.name ?? '').localeCompare(b.name ?? '')
      )
    })
  }, [dbCategories])

  /* Product filtering and sorting. */

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const min = appliedMin === '' ? null : Number(appliedMin)
    const max = appliedMax === '' ? null : Number(appliedMax)

    const filtered = products.filter((product) => {
      const name = product.name ?? ''
      const description = product.description ?? ''
      const categoryName = product.categories?.name ?? ''
      const categorySlug = product.categories?.slug ?? ''

      const productCategoryKey = getCategoryKey(
        categoryName,
        categorySlug,
      )

      const activeCategoryKey =
        activeCategory === 'all'
          ? 'all'
          : getCategoryKey(activeCategory, activeCategory)

      const inCategory =
        activeCategoryKey === 'all' ||
        productCategoryKey === activeCategoryKey

      const extraProductFields = product as Product & {
        sku?: string
        brand?: string
        model?: string
        product_code?: string
      }

      const searchableText = [
        name,
        description,
        categoryName,
        categorySlug,
        extraProductFields.sku ?? '',
        extraProductFields.brand ?? '',
        extraProductFields.model ?? '',
        extraProductFields.product_code ?? '',
      ].join(' ').toLowerCase()

      const matchesSearch =
        query === '' ||
        searchableText.includes(query)

      const price = Number(
        (product as Product & { price?: number }).price ?? 0,
      )

      const matchesMin = min === null || price >= min
      const matchesMax = max === null || price <= max

      return (
        inCategory &&
        matchesSearch &&
        matchesMin &&
        matchesMax
      )
    })

    filtered.sort((a, b) => {
      if (sortBy === 'name-desc') {
        return (b.name ?? '').localeCompare(a.name ?? '')
      }

      return (a.name ?? '').localeCompare(b.name ?? '')
    })

    return filtered
  }, [
    products,
    searchQuery,
    activeCategory,
    appliedMin,
    appliedMax,
    sortBy,
  ])

  /* Category navigation. */

  function chooseCategory(slug: string) {
    const next = new URLSearchParams(params)

    next.delete('subcat')

    if (slug === 'all') {
      next.delete('category')
    } else {
      next.set('category', slug)
    }

    setParams(next)
  }

  /* Search. */

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const next = new URLSearchParams(params)
    const query = searchInput.trim()

    if (query) {
      next.set('q', query)
    } else {
      next.delete('q')
    }

    setParams(next)
    setSearchQuery(query)
  }

  function clearSearch() {
    setSearchInput('')
    setSearchQuery('')

    const next = new URLSearchParams(params)
    next.delete('q')

    setParams(next)
  }

  /* Price filters. */

  function applyFilters() {
    const min = minPrice.trim()
    const max = maxPrice.trim()

    if (
      (min !== '' && !Number.isFinite(Number(min))) ||
      (max !== '' && !Number.isFinite(Number(max)))
    ) {
      setFilterError('Please enter valid prices.')
      return
    }

    if (
      min !== '' &&
      max !== '' &&
      Number(min) > Number(max)
    ) {
      setFilterError(
        'Minimum price cannot be greater than maximum price.',
      )
      return
    }

    if (
      (min !== '' && Number(min) < 0) ||
      (max !== '' && Number(max) < 0)
    ) {
      setFilterError('Prices cannot be negative.')
      return
    }

    setFilterError('')
    setAppliedMin(min)
    setAppliedMax(max)
    setFiltersOpen(false)
  }

  function resetFilters() {
    setMinPrice('')
    setMaxPrice('')
    setAppliedMin('')
    setAppliedMax('')
    setSortBy('name')
    setFilterError('')
  }

  const currentCategory = categories.find(
    (category) =>
      getCategoryKey(
        category.name ?? '',
        category.slug ?? '',
      ) === getCategoryKey(activeCategory, activeCategory),
  )

  const currentCategoryName =
    activeCategory === 'all'
      ? 'All Products'
      : currentCategory?.name ??
        activeCategory
          .split('-')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(' ')

  const suggestionItems = [
    suggestAc ? 'Air Conditioner' : '',
    suggestFridge ? 'Fridge/Freezer' : '',
    suggestTv ? 'TVs & Lighting' : '',
  ].filter(Boolean)

  const suggestionMessage = [
    'Hello Garbbis Electrical And Maintenance Limited!',
    'I need help choosing electrical products.',
    `Products or requirements: ${
      suggestionItems.join(', ') ||
      'Please help me choose suitable products.'
    }`,
    'Please recommend suitable options and share current prices and availability.',
  ].join('\n')

  const categoryGroups = [0, 1]

  const hasActiveFilters =
    appliedMin !== '' || appliedMax !== ''

  return (
    <main className="products-page min-h-screen overflow-hidden bg-white pb-16 text-slate-900">
      {/* PREMIUM, CSS-ONLY HERO */}
      <section className="products-hero relative isolate overflow-hidden bg-[#071726] px-4 pb-14 pt-14 text-white sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
        <div className="products-hero-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="products-glow products-glow-one pointer-events-none absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-yellow-400/15 blur-3xl" />
        <div className="products-glow products-glow-two pointer-events-none absolute -bottom-24 -right-16 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="products-hero-content mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-white/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300 shadow-lg backdrop-blur-md sm:text-xs">
            <Sparkles className="h-4 w-4" />
            The Garbbis Collection
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h1 className="products-hero-title max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
                Find the right power.
                <br />
                <span className="products-gradient-text">Light up your world.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                Explore lighting, solar equipment and essential electrical products
                for your home or business. Search the catalogue, compare options,
                and contact our team for current prices and availability.
              </p>
            </div>
            <div className="products-hero-note rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/10">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-extrabold text-white">Powering better spaces</p>
                  <p className="mt-1 text-xs text-slate-300">Lighting · Solar · Electrical</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Browse by category', 'Search products', 'Ask our team'].map((label) => (
                  <span key={label} className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[10px] font-bold text-slate-200 sm:text-xs">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PRODUCT SEARCH */}
      <section className="products-search sticky top-16 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:py-4">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-yellow-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(250,204,21,0.12)]"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />

            <input
              type="search"
              placeholder="Search lights, sockets, solar..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
              value={searchInput}
              onChange={(event) => {
                const value = event.target.value
                setSearchInput(value)
                // Filter immediately as the customer types; the Search button
                // still saves the query in the URL for shareable searches.
                setSearchQuery(value)
              }}
            />

            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 sm:px-7 sm:text-sm"
            >
              Search
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between gap-3 px-1">
            <p className="text-[11px] text-slate-500 sm:text-xs">
              Search by product name, category, brand or model.
            </p>
            {searchQuery.trim() && !loading && !error && (
              <p className="shrink-0 text-[11px] font-bold text-amber-700 sm:text-xs" aria-live="polite">
                {visible.length} {visible.length === 1 ? 'match' : 'matches'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORY CAROUSEL */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white py-7 sm:py-10">
        <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              Find what you need
            </div>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Shop by category
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Explore lighting, solar and electrical solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => chooseCategory('all')}
            className="group shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-slate-950 sm:px-4 sm:py-2.5"
          >
            View all
            <ArrowRight className="ml-1.5 inline h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="garbbis-marquee relative">
            <div className="garbbis-marquee-track flex w-max">
              {categoryGroups.map((group) => (
                <div
                  key={group}
                  aria-hidden={group === 1}
                  className="flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6"
                >
                  {categories.map((category) => {
                    const categoryKey = getCategoryKey(
                      category.name ?? '',
                      category.slug ?? '',
                    )

                    const selected =
                      activeCategory !== 'all' &&
                      getCategoryKey(
                        activeCategory,
                        activeCategory,
                      ) === categoryKey

                    /* Prefer real photography for these key categories. */
                    const imageSrc =
                      categoryKey === 'outdoor-lights'
                        ? outdoorLightImage
                        : categoryKey === 'solar-accessories'
                          ? solarAccessoriesImage
                          : category.img ||
                            createCategoryFallback(
                              category.name ?? 'Electrical Products',
                              category.slug ?? '',
                            )

                    return (
                      <button
                        key={`${group}-${category.id}-${category.slug}`}
                        type="button"
                        tabIndex={group === 1 ? -1 : 0}
                        onClick={() =>
                          chooseCategory(
                            categoryKey === 'outdoor-lights'
                              ? 'outdoor-lights'
                              : category.slug ?? 'all',
                          )
                        }
                        aria-label={`View ${category.name}`}
                        aria-pressed={selected}
                        className="group flex w-[112px] shrink-0 flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-4 sm:w-[140px]"
                      >
                        <div
                          className={`relative h-[76px] w-[108px] overflow-hidden rounded-[50%] bg-slate-100 shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:h-[96px] sm:w-[136px] ${
                            selected
                              ? 'ring-2 ring-yellow-400 ring-offset-2'
                              : 'ring-1 ring-slate-200 group-hover:ring-yellow-400/70'
                          }`}
                        >
                          <img
                            src={imageSrc}
                            alt={category.name ?? 'Electrical product category'}
                            loading={group === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            onError={(event) => {
                              const image = event.currentTarget

                              if (
                                image.dataset.fallbackApplied === 'true'
                              ) {
                                return
                              }

                              image.dataset.fallbackApplied = 'true'

                              if (categoryKey === 'outdoor-lights') {
                                image.src = outdoorLightImageAlternate
                              } else if (categoryKey === 'solar-accessories') {
                                image.src = solarAccessoriesImageAlternate
                              } else {
                                image.src = createCategoryFallback(
                                  category.name ?? 'Electrical Products',
                                  category.slug ?? '',
                                )
                              }
                            }}
                            className="h-full w-full rounded-[50%] object-cover object-center transition duration-700 group-hover:scale-110"
                          />

                          <div className="pointer-events-none absolute inset-0 rounded-[50%] bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

                          {selected && (
                            <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-slate-950 shadow-md">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>

                        <span
                          className={`mt-3 line-clamp-2 min-h-8 text-xs font-extrabold leading-4 transition sm:text-sm ${
                            selected
                              ? 'text-amber-700'
                              : 'text-slate-700 group-hover:text-slate-950'
                          }`}
                        >
                          {category.name}
                        </span>

                        <span
                          className={`mt-1 h-1 w-5 rounded-full transition-all ${
                            selected
                              ? 'w-8 bg-yellow-400'
                              : 'bg-transparent group-hover:bg-yellow-300'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="px-4 text-sm text-slate-500">
            Categories will appear here when available.
          </p>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-5 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-5 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-10" />

        <p className="mt-3 text-center text-[10px] text-slate-400">
          Hover over the categories to pause the movement.
        </p>
      </section>

      {/* MAIN CATALOGUE */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          {/* SIDEBAR */}

          <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3 bg-[#102a43] p-4 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
                  <HelpCircle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-black">
                    Need help choosing?
                  </h2>
                  <p className="mt-0.5 text-[10px] text-slate-300">
                    Get advice from our team
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="mb-4 text-xs leading-5 text-slate-600">
                  Tell us what you need and we’ll help you find suitable
                  products for your home or business.
                </p>

                <div className="space-y-3 text-xs font-semibold text-slate-800">
                  {[
                    {
                      label: 'TVs & lights',
                      checked: suggestTv,
                      onChange: setSuggestTv,
                    },
                    {
                      label: 'Fridge / freezer',
                      checked: suggestFridge,
                      onChange: setSuggestFridge,
                    },
                    {
                      label: 'Air conditioner',
                      checked: suggestAc,
                      onChange: setSuggestAc,
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(event) =>
                          item.onChange(event.target.checked)
                        }
                        className="h-4 w-4 rounded accent-yellow-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <a
                  href={buildWhatsAppUrl(suggestionMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnWhatsApp} mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask on WhatsApp
                </a>

                <p className="mt-3 text-center text-[10px] text-slate-400">
                  Ask about prices, specifications and availability.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-100 p-4">
              <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full bg-yellow-300/30 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-slate-950 shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    Power your space
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-600">
                  Explore solar panels, inverters and batteries for home
                  or business power needs.
                </p>

                <button
                  type="button"
                  onClick={() => chooseCategory('solar-panels')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2"
                >
                  Explore solar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    Need a specific item?
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Contact our team to ask about products not currently
                    shown in the catalogue.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT AREA */}

          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                  <span className="h-1.5 w-5 rounded-full bg-yellow-400" />
                  Garbbis catalogue
                </div>

                <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {currentCategoryName}
                </h1>

                {!loading && !error && (
                  <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                    Showing {visible.length}{' '}
                    {visible.length === 1 ? 'product' : 'products'}
                    {searchQuery ? ` for "${searchQuery}"` : ''}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs transition hover:border-slate-300">
                  <span className="font-semibold text-slate-500">
                    Sort
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="max-w-[120px] bg-transparent font-bold text-slate-900 outline-none"
                    aria-label="Sort products"
                  >
                    <option value="name">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    filtersOpen || hasActiveFilters
                      ? 'border-yellow-400 bg-yellow-50 text-slate-950'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters

                  {hasActiveFilters && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-black text-slate-950">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">
                  Active price filters:
                </span>

                {appliedMin !== '' && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                    Min: {Number(appliedMin).toLocaleString()}
                  </span>
                )}

                {appliedMax !== '' && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                    Max: {Number(appliedMax).toLocaleString()}
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900"
                >
                  Clear filters
                </button>
              </div>
            )}

            {filtersOpen && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black">
                      Refine your results
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Set a price range to narrow your options.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Minimum price
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) => {
                        setMinPrice(event.target.value)
                        setFilterError('')
                      }}
                      placeholder="Enter minimum"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    Maximum price
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) => {
                        setMaxPrice(event.target.value)
                        setFilterError('')
                      }}
                      placeholder="Enter maximum"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    />
                  </label>
                </div>

                {filterError && (
                  <p
                    role="alert"
                    className="mt-3 text-xs font-semibold text-red-600"
                  >
                    {filterError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={applyFilters}
                  className="mt-4 rounded-xl bg-[#102a43] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2"
                >
                  Apply filters
                </button>

                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  Price filters require a numeric price field in your
                  product records. Products without a price are treated
                  as zero for filtering.
                </p>
              </div>
            )}

            {loading && <Loading />}

            {error && <Notice variant="error">{error}</Notice>}

            {!loading && !error && visible.length === 0 && (
              <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white px-5 py-14 text-center sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50 text-amber-600 shadow-sm">
                  {searchQuery ? (
                    <Search className="h-7 w-7" />
                  ) : (
                    <PackageSearch className="h-7 w-7" />
                  )}
                </div>

                <h2 className="mt-5 text-lg font-black text-slate-900 sm:text-xl">
                  No matching products
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-600 sm:text-sm">
                  Try a different search term or category, adjust your price
                  filters, or ask our team about availability.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {(searchQuery || hasActiveFilters) && (
                    <button
                      type="button"
                      onClick={() => {
                        clearSearch()
                        resetFilters()
                        chooseCategory('all')
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-400"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear search and filters
                    </button>
                  )}

                  <a
                    href={buildWhatsAppUrl(
                      `Hello Garbbis, do you have products available in the ${currentCategoryName} category? ${
                        searchQuery
                          ? `I am looking for "${searchQuery}". `
                          : ''
                      }Please share suitable options, current prices and availability.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${btnWhatsApp} inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask about availability
                  </a>
                </div>
              </div>
            )}

            {!loading && !error && visible.length > 0 && (
              <div
                key={`${activeCategory}-${searchQuery}-${appliedMin}-${appliedMax}-${sortBy}`}
                className="products-grid grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3"
                aria-live="polite"
                aria-label="Filtered products"
              >
                {visible.map((product, index) => (
                  <div
                    key={product.id}
                    className="product-result"
                    style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && visible.length > 0 && (
              <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                    <ImageIcon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      Need help with a product?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Ask our team about specifications, prices and stock.
                    </p>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Hello Garbbis Electrical And Maintenance Limited! I am browsing your catalogue and would like help with ${currentCategoryName}. Please share prices and availability.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnWhatsApp} inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact our team
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORY CAROUSEL ANIMATION */}

      <style>{`
        .products-hero {
          background-image:
            radial-gradient(ellipse at 15% 10%, rgba(250, 204, 21, 0.09), transparent 38%),
            radial-gradient(ellipse at 90% 85%, rgba(16, 185, 129, 0.10), transparent 40%);
        }

        .products-hero-grid {
          opacity: .6;
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 95%);
        }

        .products-hero-title {
          animation: productsHeroEnter .75s cubic-bezier(.2,.75,.25,1) both;
        }

        .products-gradient-text {
          display: inline-block;
          padding-bottom: .08em;
          color: transparent;
          background: linear-gradient(100deg, #fde68a 0%, #facc15 45%, #86efac 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: productsGradient 7s ease-in-out infinite;
        }

        .products-hero-note {
          animation: productsHeroEnter .8s .15s cubic-bezier(.2,.75,.25,1) both;
        }

        .products-glow-one { animation: productsFloat 12s ease-in-out infinite; }
        .products-glow-two { animation: productsFloat 15s ease-in-out infinite reverse; }

        .product-result {
          min-width: 0;
          animation: productReveal .45s cubic-bezier(.2,.7,.25,1) both;
        }

        .product-result > * {
          height: 100%;
        }

        .products-grid > .product-result:hover {
          z-index: 1;
        }

        .products-search input::-webkit-search-cancel-button {
          cursor: pointer;
        }

        @keyframes productsHeroEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes productReveal {
          from { opacity: 0; transform: translateY(12px) scale(.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes productsFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(16px, -18px, 0); }
        }

        @keyframes productsGradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        .garbbis-marquee {
          width: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 3%,
            black 97%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 3%,
            black 97%,
            transparent
          );
        }

        .garbbis-marquee-track {
          width: max-content;
          animation: garbbisCategoryScroll 42s linear infinite;
          transform: translateZ(0);
          will-change: transform;
        }

        .garbbis-marquee:hover .garbbis-marquee-track,
        .garbbis-marquee:focus-within .garbbis-marquee-track {
          animation-play-state: paused;
        }

        @keyframes garbbisCategoryScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .garbbis-marquee-track {
            animation-duration: 34s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .garbbis-marquee-track,
          .products-hero-title,
          .products-hero-note,
          .products-glow-one,
          .products-glow-two,
          .products-gradient-text,
          .product-result {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  )
}