export const ENQUIRY_TYPES = [
  { value: 'product_enquiry', label: 'Product enquiry' },
  { value: 'service_enquiry', label: 'Service enquiry' },
  { value: 'installation_quote', label: 'Solar / inverter installation quote' },
  { value: 'repair_maintenance', label: 'Repair or maintenance' },
  { value: 'general', label: 'General question' },
] as const

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]['value']

export interface EnquiryFormValues {
  customer_name: string
  phone: string
  location: string
  enquiry_type: EnquiryType
  item: string
  requirements: string
  message: string
  website: string
}

export type FormErrors = Partial<Record<keyof EnquiryFormValues, string>>

export const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,18}$/

export function validateEnquiry(v: EnquiryFormValues): FormErrors {
  const errors: FormErrors = {}
  const name = v.customer_name.trim()
  const location = v.location.trim()
  if (name.length < 2 || name.length > 100) errors.customer_name = 'Enter your name (2 to 100 characters).'
  if (!PHONE_PATTERN.test(v.phone.trim())) {
    errors.phone = 'Enter a valid phone number, for example 0801 234 5678 or +234 801 234 5678.'
  }
  if (location.length < 2 || location.length > 150) errors.location = 'Enter your location (2 to 150 characters).'
  if (!ENQUIRY_TYPES.some((t) => t.value === v.enquiry_type)) errors.enquiry_type = 'Choose an enquiry type.'
  if (v.requirements.length > 1000) errors.requirements = 'Please keep this under 1000 characters.'
  if (v.message.length > 2000) errors.message = 'Please keep your message under 2000 characters.'
  return errors
}