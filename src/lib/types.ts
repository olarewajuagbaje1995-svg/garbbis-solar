export type Availability = 'in_stock' | 'out_of_stock' | 'contact'
export type EnquiryStatus = 'new' | 'contacted' | 'resolved'

export interface Category {
  id: string
  slug: string
  name: string
  sort_order: number
}

export interface Spec {
  label: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  category_id: string
  price_ngn: number | null
  availability: Availability
  specifications: Spec[]
  image_paths: string[]
  is_published: boolean
  created_at: string
  updated_at: string
  categories: { name: string; slug: string } | null
}

export interface Service {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  image_path: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Enquiry {
  id: string
  customer_name: string
  phone: string
  location: string
  enquiry_type: string
  product_id: string | null
  service_id: string | null
  item_label: string | null
  requirements: string | null
  message: string | null
  status: EnquiryStatus
  created_at: string
}