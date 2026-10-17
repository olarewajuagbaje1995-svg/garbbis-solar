import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { LoaderCircle, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { explainError } from '../lib/errors'
import { ENQUIRY_TYPES, validateEnquiry } from '../lib/validation'
import type { EnquiryFormValues, FormErrors } from '../lib/validation'
import { buildEnquiryMessage, buildWhatsAppUrl, openWhatsApp } from '../lib/whatsapp'
import { btnPrimary, btnWhatsApp, inputCls, labelCls } from '../lib/styles'
import Notice from './Notice'

export interface InitialItem {
  kind: 'product' | 'service'
  id: string
  name: string
}

const emptyValues = (initial?: InitialItem): EnquiryFormValues => ({
  customer_name: '',
  phone: '',
  location: '',
  enquiry_type: initial?.kind === 'service' ? 'service_enquiry' : initial ? 'product_enquiry' : 'general',
  item: '', // Handled dynamically below via Budget
  requirements: '',
  message: '',
  website: '',
})

export default function EnquiryForm({ initialItem }: { initialItem?: InitialItem }) {
  const [values, setValues] = useState<EnquiryFormValues>(() => emptyValues(initialItem))
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [waUrl, setWaUrl] = useState<string | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const idRef = useRef<string>(crypto.randomUUID())

  // New Lead Qualification States
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')

  function set<K extends keyof EnquiryFormValues>(key: K, value: EnquiryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function buildMessageData() {
    const typeLabel = ENQUIRY_TYPES.find((t) => t.value === values.enquiry_type)?.label ?? values.enquiry_type
    
    // Safely combine new fields to fit within the existing database schema seamlessly
    const finalItemLabel = [
      initialItem ? `Item: ${initialItem.name}` : '',
      budget ? `Budget: ${budget}` : ''
    ].filter(Boolean).join(' | ') || null

    const finalRequirements = [
      timeline ? `Timeline/Urgency: ${timeline}` : '',
      values.requirements.trim()
    ].filter(Boolean).join(' | ') || null

    const text = buildEnquiryMessage({
      id: idRef.current,
      customer_name: values.customer_name.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      enquiry_typeLabel: typeLabel,
      item_label: finalItemLabel,
      requirements: finalRequirements,
      message: values.message.trim() || null,
    })

    return { finalItemLabel, finalRequirements, text }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    const found = validateEnquiry(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setFormError('Please fix the highlighted fields.')
      return
    }
    setFormError(null)

    const { finalItemLabel, finalRequirements, text } = buildMessageData()
    const url = buildWhatsAppUrl(text)

    // Honeypot field catch for bots
    if (values.website.trim() !== '') {
      setWaUrl(url)
      setStatus('success')
      return
    }

    setStatus('submitting')
    
    const { error } = await supabase.from('enquiries').insert({
      id: idRef.current,
      customer_name: values.customer_name.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      enquiry_type: values.enquiry_type,
      product_id: initialItem?.kind === 'product' ? initialItem.id : null,
      service_id: initialItem?.kind === 'service' ? initialItem.id : null,
      item_label: finalItemLabel,
      requirements: finalRequirements,
      message: values.message.trim() || null,
    })

    // If exact ID exists (23505), user double clicked. Treat as success.
    if (error && error.code !== '23505') {
      setStatus('idle')
      setWaUrl(url)
      setFormError(
        `${explainError(error)} Your details are still in the form. You can try again, or send them directly to us on WhatsApp using the button below.`,
      )
      return
    }

    setWaUrl(url)
    setStatus('success')
    setPopupBlocked(!openWhatsApp(url))
  }

  function reset() {
    idRef.current = crypto.randomUUID()
    setValues(emptyValues(initialItem))
    setBudget('')
    setTimeline('')
    setErrors({})
    setFormError(null)
    setWaUrl(null)
    setPopupBlocked(false)
    setStatus('idle')
  }

  if (status === 'success' && waUrl) {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in duration-500">
        <Notice variant="success">
          <p className="font-bold text-lg">Thank you. Your enquiry has been recorded.</p>
          <p className="mt-1 text-sm text-green-800">
            WhatsApp should open with your message already written. <strong>You must tap Send in WhatsApp yourself.</strong> Our engineers will review your timeline and budget and reply shortly.
          </p>
        </Notice>
        {popupBlocked && (
          <Notice variant="info">
            Your browser blocked WhatsApp from opening automatically. Please use the button below.
          </Notice>
        )}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className={`${btnWhatsApp} w-full shadow-md`}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> Open WhatsApp
        </a>
        <div className="text-center pt-2">
          <button type="button" onClick={reset} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline transition-colors">
            Submit another request
          </button>
        </div>
      </div>
    )
  }

  const fieldError = (key: keyof EnquiryFormValues) =>
    errors[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-xs font-semibold text-red-600">
        {errors[key]}
      </p>
    ) : null

  const busy = status === 'submitting'

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={busy}>
      {formError && <Notice variant="error">{formError}</Notice>}

      {/* Dynamic Product/Service Reference Badge */}
      {initialItem && (
        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm w-full">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Enquiring about: {initialItem.name}
        </div>
      )}

      <div>
        <label htmlFor="customer_name" className={labelCls}>Your name *</label>
        <input id="customer_name" className={inputCls} value={values.customer_name} autoComplete="name"
          onChange={(e) => set('customer_name', e.target.value)} aria-invalid={Boolean(errors.customer_name)}
          aria-describedby={errors.customer_name ? 'customer_name-error' : undefined} disabled={busy} />
        {fieldError('customer_name')}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelCls}>Phone number *</label>
          <input id="phone" type="tel" className={inputCls} value={values.phone} autoComplete="tel"
            onChange={(e) => set('phone', e.target.value)} aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined} disabled={busy} />
          {fieldError('phone')}
        </div>
        <div>
          <label htmlFor="location" className={labelCls}>Location *</label>
          <input id="location" className={inputCls} value={values.location} placeholder="Town / city / state"
            onChange={(e) => set('location', e.target.value)} aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? 'location-error' : undefined} disabled={busy} />
          {fieldError('location')}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-1">
        <div>
          <label htmlFor="enquiry_type" className={labelCls}>Enquiry type *</label>
          <select id="enquiry_type" className={inputCls} value={values.enquiry_type} disabled={busy}
            onChange={(e) => set('enquiry_type', e.target.value as EnquiryFormValues['enquiry_type'])}>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {fieldError('enquiry_type')}
        </div>
      </div>

      {/* Updated Budget & Timeline Qualifiers */}
      <div className="grid gap-5 sm:grid-cols-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <label htmlFor="timeline" className="mb-1 block text-sm font-bold text-slate-800">When do you need this?</label>
          <select id="timeline" className={`${inputCls} font-medium text-emerald-800`} value={timeline} disabled={busy}
            onChange={(e) => setTimeline(e.target.value)}>
            <option value="">Select timeline...</option>
            <option value="Immediately (Urgent priority)">Immediately (Urgent priority)</option>
            <option value="Within 1 - 2 weeks">Within 1 - 2 weeks</option>
            <option value="Within a month">Within a month</option>
            <option value="Just researching / Planning">Just researching / Planning</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-bold text-slate-800">Estimated budget</label>
          <select id="budget" className={`${inputCls} font-medium text-emerald-800`} value={budget} disabled={busy}
            onChange={(e) => setBudget(e.target.value)}>
            <option value="">Select budget range...</option>
            <option value="Under ₦500k">Under ₦500k</option>
            <option value="₦500k - ₦1.5m">₦500k - ₦1.5m</option>
            <option value="₦1.5m - ₦3m">₦1.5m - ₦3m</option>
            <option value="₦3m - ₦5m">₦3m - ₦5m</option>
            <option value="₦5m - ₦10m">₦5m - ₦10m</option>
            <option value="₦10m - ₦20m">₦10m - ₦20m</option>
            <option value="₦20m - ₦35m">₦20m - ₦35m</option>
            <option value="₦35m - ₦50m">₦35m - ₦50m</option>
            <option value="Over ₦50m [Industrial Solar Setup]">Over ₦50m [Industrial Solar Setup]</option>
            <option value="Need an assessment">Not sure / Need an assessment</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="requirements" className={labelCls}>
          Specific requirements (optional) - e.g. inverter size, appliances to power
        </label>
        <textarea id="requirements" rows={3} className={inputCls} value={values.requirements} disabled={busy}
          onChange={(e) => set('requirements', e.target.value)} aria-invalid={Boolean(errors.requirements)} />
        {fieldError('requirements')}
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>Additional message (optional)</label>
        <textarea id="message" rows={2} className={inputCls} value={values.message} disabled={busy}
          onChange={(e) => set('message', e.target.value)} aria-invalid={Boolean(errors.message)} />
        {fieldError('message')}
      </div>

      {/* Hidden bot catch */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <button type="submit" className={`${btnPrimary} w-full sm:w-auto px-8 py-3.5 shadow-md text-base`} disabled={busy}>
          {busy ? (
            <><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> Processing...</>
          ) : (
            'Submit Request'
          )}
        </button>
        {waUrl && formError && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={`${btnWhatsApp} w-full sm:w-auto px-6 py-3.5`}>
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Bypass to WhatsApp
          </a>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 text-center sm:text-left">
        WhatsApp will open securely with your details pre-filled.
      </p>
    </form>
  )
}