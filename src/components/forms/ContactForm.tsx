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
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
          ✅
        </div>
        <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text-primary mb-1.5">Message Sent!</h3>
        <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary max-w-md mx-auto leading-relaxed">{apiMsg}</p>
      </div>
    )
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-2.5 sm:py-3 border rounded-xl text-text-primary dark:text-dark-text-primary text-sm transition-all duration-200
     focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan
     placeholder:text-text-secondary/60 dark:placeholder:text-dark-text-secondary/50 shadow-2xs ${
      errors[field]
        ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20'
        : 'border-border-soft dark:border-dark-border bg-white dark:bg-dark-surface hover:border-gray-300 dark:hover:border-dark-border-soft'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-4.5">
      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm px-4 py-3 rounded-xl" role="alert">
          {apiMsg}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="cf-name" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="cf-name"
          type="text"
          value={fields.name}
          onChange={set('name')}
          placeholder="Your full name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'cf-name-error' : undefined}
          className={inputClass('name')}
        />
        {errors.name && (
          <p id="cf-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="cf-email" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="cf-email"
          type="email"
          value={fields.email}
          onChange={set('email')}
          placeholder="you@example.com"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'cf-email-error' : undefined}
          className={inputClass('email')}
        />
        {errors.email && (
          <p id="cf-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="cf-phone" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
          Phone Number <span className="text-text-secondary/70 dark:text-dark-text-secondary/70 font-normal normal-case">(optional)</span>
        </label>
        <input
          id="cf-phone"
          type="tel"
          value={fields.phone}
          onChange={set('phone')}
          placeholder="(555) 000-0000"
          className={inputClass('phone')}
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="cf-subject" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          id="cf-subject"
          value={fields.subject}
          onChange={set('subject')}
          aria-required="true"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'cf-subject-error' : undefined}
          className={inputClass('subject')}
        >
          <option value="" disabled className="dark:bg-dark-surface dark:text-dark-text-primary">Select a topic…</option>
          <option value="General Inquiry" className="dark:bg-dark-surface dark:text-dark-text-primary">General Inquiry</option>
          <option value="Volunteer Programs" className="dark:bg-dark-surface dark:text-dark-text-primary">Volunteer Programs</option>
          <option value="Environmental Programs" className="dark:bg-dark-surface dark:text-dark-text-primary">Environmental Programs &amp; Workshops</option>
          <option value="Partnership Opportunities" className="dark:bg-dark-surface dark:text-dark-text-primary">Partnership Opportunities</option>
          <option value="Donations &amp; Support" className="dark:bg-dark-surface dark:text-dark-text-primary">Donations &amp; Support</option>
          <option value="Other" className="dark:bg-dark-surface dark:text-dark-text-primary">Other</option>
        </select>
        {errors.subject && (
          <p id="cf-subject-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={fields.message}
          onChange={set('message')}
          placeholder="How can we help? Share your question, idea, or how you'd like to get involved…"
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'cf-message-error' : undefined}
          className={inputClass('message')}
        />
        {errors.message && (
          <p id="cf-message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full btn-primary text-sm font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
      >
        {status === 'loading' ? 'Sending Message…' : 'Send Message'}
      </button>
    </form>
  )
}
