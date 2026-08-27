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
    setApiMsg(data.message)
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-forest-dark mb-2">Message Sent!</h3>
        <p className="text-ink-muted">{apiMsg}</p>
      </div>
    )
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-3 border rounded-xl text-ink text-sm transition-all duration-200
     focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent
     placeholder:text-ink-subtle ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl" role="alert">
          {apiMsg}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="cf-name" className="block text-sm font-semibold text-forest-dark mb-2">
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
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-email" className="block text-sm font-semibold text-forest-dark mb-2">
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
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="cf-phone" className="block text-sm font-semibold text-forest-dark mb-2">
            Phone <span className="text-ink-subtle font-normal">(optional)</span>
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
        <label htmlFor="cf-subject" className="block text-sm font-semibold text-forest-dark mb-2">
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
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className="block text-sm font-semibold text-forest-dark mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={6}
          value={fields.message}
          onChange={set('message')}
          className={`${inputClass('message')} resize-y min-h-[120px]`}
          placeholder="Tell us what's on your mind…"
          required
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
