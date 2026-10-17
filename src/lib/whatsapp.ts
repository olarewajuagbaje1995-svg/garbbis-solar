import { BUSINESS } from './config'

export interface WhatsAppEnquiry {
  id: string
  customer_name: string
  phone: string
  location: string
  enquiry_typeLabel: string
  item_label: string | null
  requirements: string | null
  message: string | null
}

export function buildEnquiryMessage(e: WhatsAppEnquiry): string {
  const lines = [
    `Hello ${BUSINESS.shortName}, I would like to make an enquiry.`,
    '',
    `Name: ${e.customer_name}`,
    `Phone: ${e.phone}`,
    `Location: ${e.location}`,
    `Enquiry type: ${e.enquiry_typeLabel}`,
  ]
  if (e.item_label) lines.push(`Interested in: ${e.item_label}`)
  if (e.requirements) lines.push(`Requirements: ${e.requirements}`)
  if (e.message) lines.push(`Message: ${e.message}`)
  lines.push('', `Reference: ${e.id.slice(0, 8)}`)
  return lines.join('\n')
}

export function buildWhatsAppUrl(message: string, number: string = BUSINESS.whatsappNumber): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(url: string): boolean {
  const w = window.open(url, '_blank')
  if (!w) return false
  w.opener = null
  return true
}

export function toWhatsAppDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  return digits
}