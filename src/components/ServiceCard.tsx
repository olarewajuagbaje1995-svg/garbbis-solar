import type { Service } from '../lib/types'
import { cardCls } from '../lib/styles'
import ProductImage from './ProductImage'

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className={`${cardCls} flex flex-col overflow-hidden`}>
      <ProductImage path={service.image_path} alt={service.title} className="h-44 w-full" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold text-forest-700">{service.title}</h3>
        <p className="text-sm text-slate-700">{service.summary}</p>
        {service.description && (
          <p className="whitespace-pre-line text-sm text-slate-600">{service.description}</p>
        )}
      </div>
    </article>
  )
}