import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { formatNaira } from '../lib/format'
import { cardCls } from '../lib/styles'
import AvailabilityBadge from './AvailabilityBadge'
import ProductImage from './ProductImage'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className={`${cardCls} group flex flex-col overflow-hidden transition hover:shadow-md`}
    >
      <ProductImage path={product.image_paths[0]} alt={product.name} className="h-44 w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
          {product.categories?.name ?? 'Product'}
        </p>
        <h3 className="font-semibold text-slate-900 group-hover:text-forest-700">{product.name}</h3>
        <p className="text-lg font-bold text-forest-700">{formatNaira(product.price_ngn)}</p>
        <div className="mt-auto">
          <AvailabilityBadge value={product.availability} />
        </div>
      </div>
    </Link>
  )
}