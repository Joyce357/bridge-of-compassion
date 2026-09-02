'use client'
// ─── Contact Form Component ───────────────────────────────────────────────

import { useState, FormEvent } from 'react'

interface FieldErrors {
  name?:    string
  email?:   string
  phone?:   string
  subject?: string
  message?: string
  [key: string]: string | undefined
}

export default function ContactForm() {
  const [fields, setFields] = useState({
    name:    '',
    email:   '',
    phone:   '',
    subject: '',
    message: '',
  })
  const [errors,  setErrors]  = useState<FieldErrors>({})
  const [status,  setStatus]  = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [apiMsg,  setApiMsg]  = useState('')

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrors({})
    setApiMsg('')

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(fields),
      })

      const data = await res.json()

      if (res.status === 422 && data.fields) {
        setErrors(data.fields)
        setStatus('idle')
        return
      }

      if (!res.ok) {
        setApiMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
      setApiMsg(data.message ?? 'Thank you for reaching out. We have received your message.')
    } catch {
      setApiMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
          ✅
        </div>
        <h3 className="text-lg font-bold text-brand-navy mb-1.5">Message Sent!</h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">{apiMsg}</p>
      </div>
    )
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-2.5 sm:py-3 border rounded-xl text-text-primary text-sm transition-all duration-200
     focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green
     placeholder:text-text-secondary/60 shadow-2xs ${
      errors[field]
        ? 'border-red-400 bg-red-50/30'
        : 'border-border-soft bg-white hover:border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-4.5">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl" role="alert">
          {apiMsg}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="cf-name" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="cf-name"
          type="text"
          value={fields.name}
          onChange={set('name')}
          className={inputClass('name')}
          placeholder="Your full name"
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-email" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-email"
            type="email"
            value={fields.email}
            onChange={set('email')}
            className={inputClass('email')}
            placeholder="your@email.com"
            required
          />
          {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="cf-phone" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            Phone <span className="text-text-secondary/70 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            value={fields.phone}
            onChange={set('phone')}
            className={inputClass('phone')}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="cf-subject" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="cf-subject"
          type="text"
          value={fields.subject}
          onChange={set('subject')}
          className={inputClass('subject')}
          placeholder="What would you like to discuss?"
          required
        />
        {errors.subject && <p className="mt-1 text-xs text-red-600 font-medium">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={fields.message}
          onChange={set('message')}
          className={`${inputClass('message')} resize-y min-h-[110px]`}
          placeholder="Tell us what's on your mind…"
          required
        />
        {errors.message && <p className="mt-1 text-xs text-red-600 font-medium">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === 'loading' ? 'Sending Message…' : 'Send Message'}
      </button>
    </form>
  )
}
