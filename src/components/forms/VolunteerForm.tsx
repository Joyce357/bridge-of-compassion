'use client'
// ─── Volunteer Application Form ───────────────────────────────────────────

import { useState, FormEvent } from 'react'

const INTERESTS = [
  'Community Development',
  'Environmental Stewardship',
  'Youth Programs',
  'Event Support',
  'Fundraising',
  'Administration',
  'Communications & Social Media',
  'Other',
]

const AVAILABILITY_OPTIONS = [
  'Weekdays',
  'Weekends',
  'Evenings',
  'Flexible',
  'As Needed',
]

interface FieldErrors {
  firstName?:    string
  lastName?:     string
  email?:        string
  phone?:        string
  location?:     string
  interests?:    string
  availability?: string
  message?:      string
  consent?:      string
  [key: string]: string | undefined
}

interface VolunteerFormProps {
  onSuccess?: () => void
  onClose?: () => void
  isModal?: boolean
}

export default function VolunteerForm({
  onSuccess,
  onClose,
  isModal = false,
}: VolunteerFormProps = {}) {
  const [fields, setFields] = useState({
    firstName:    '',
    lastName:     '',
    email:        '',
    phone:        '',
    location:     '',
    availability: '',
    message:      '',
  })
  const [interests, setInterests] = useState<string[]>([])
  const [consent,   setConsent]   = useState(false)
  const [errors,    setErrors]    = useState<FieldErrors>({})
  const [status,    setStatus]    = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [apiMsg,    setApiMsg]    = useState('')

  const set = (key: keyof typeof fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
    setErrors((prev) => ({ ...prev, interests: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrors({})
    setApiMsg('')

    try {
      const res = await fetch('/api/volunteer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...fields, interests, consent }),
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
      setApiMsg(data.message ?? 'Thank you for volunteering with Bridge of Compassion. Your application has been received.')
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      setApiMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  const resetForm = () => {
    setFields({
      firstName:    '',
      lastName:     '',
      email:        '',
      phone:        '',
      location:     '',
      availability: '',
      message:      '',
    })
    setInterests([])
    setConsent(false)
    setErrors({})
    setStatus('idle')
    setApiMsg('')
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xs">
          🤝
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy">
            Application Received!
          </h3>
          <p className="text-text-secondary text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {apiMsg || 'Thank you for volunteering with Bridge of Compassion. Your application has been received.'}
          </p>
        </div>
        <p className="text-xs text-text-secondary/80">
          Our team will review your application and be in touch soon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-green text-brand-warm-white font-semibold text-xs sm:text-sm hover:bg-brand-green/90 transition-all cursor-pointer shadow-xs"
            >
              {isModal ? 'Close Window' : 'Return to Website'}
            </button>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border-soft bg-white text-text-secondary hover:text-brand-navy font-semibold text-xs sm:text-sm hover:bg-brand-cream/50 transition-all cursor-pointer"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-2.5 sm:py-3 border rounded-xl text-text-primary text-sm transition-all shadow-2xs
     focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green
     placeholder:text-text-secondary/50 ${
      errors[field] ? 'border-red-400 bg-red-50/50' : 'border-border-soft bg-white hover:border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl" role="alert">
          {apiMsg}
        </div>
      )}

      {/* Name */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vf-first" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input id="vf-first" type="text" value={fields.firstName} onChange={set('firstName')} className={inputClass('firstName')} placeholder="First" required />
          {errors.firstName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="vf-last" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input id="vf-last" type="text" value={fields.lastName} onChange={set('lastName')} className={inputClass('lastName')} placeholder="Last" required />
          {errors.lastName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vf-email" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input id="vf-email" type="email" value={fields.email} onChange={set('email')} className={inputClass('email')} placeholder="your@email.com" required />
          {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="vf-phone" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
            Phone <span className="text-text-secondary/70 font-normal lowercase">(optional)</span>
          </label>
          <input id="vf-phone" type="tel" value={fields.phone} onChange={set('phone')} className={inputClass('phone')} placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="vf-location" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Location <span className="text-text-secondary/70 font-normal lowercase">(city, province)</span>
        </label>
        <input id="vf-location" type="text" value={fields.location} onChange={set('location')} className={inputClass('location')} placeholder="e.g. Toronto, ON" />
      </div>

      {/* Areas of Interest */}
      <div>
        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
          Areas of Interest <span className="text-red-500">*</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-brand-cream/40 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                className="w-4 h-4 rounded border-border-soft text-brand-green focus:ring-brand-green"
              />
              <span className="text-xs sm:text-sm text-text-primary">{interest}</span>
            </label>
          ))}
        </div>
        {errors.interests && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.interests}</p>}
      </div>

      {/* Availability */}
      <div>
        <label htmlFor="vf-avail" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Availability <span className="text-red-500">*</span>
        </label>
        <select
          id="vf-avail"
          value={fields.availability}
          onChange={set('availability')}
          className={inputClass('availability')}
          required
        >
          <option value="">Select your availability</option>
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.availability && <p className="mt-1 text-xs text-red-600 font-medium">{errors.availability}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="vf-msg" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
          Additional Message <span className="text-text-secondary/70 font-normal lowercase">(optional)</span>
        </label>
        <textarea
          id="vf-msg"
          rows={3}
          value={fields.message}
          onChange={set('message')}
          className={`${inputClass('message')} resize-y`}
          placeholder="Tell us more about yourself or any relevant experience…"
        />
      </div>

      {/* Consent */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              setErrors((prev) => ({ ...prev, consent: undefined }))
            }}
            className="mt-0.5 w-4 h-4 rounded border-border-soft text-brand-green focus:ring-brand-green"
          />
          <span className="text-xs text-text-secondary leading-relaxed">
            I consent to Bridge of Compassion storing my information to process this application
            and contact me about volunteer opportunities. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-red-600 font-medium">{errors.consent}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === 'loading' ? 'Submitting Application…' : 'Submit Application'}
      </button>
    </form>
  )
}
