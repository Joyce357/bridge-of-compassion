'use client'
// ─── Donation Form Component ──────────────────────────────────────────────────
// Allows users to submit donation intents (or real donations once payment processor is live).

import { useState } from 'react'
import Button from '@/components/ui/Button'

const PRESET_AMOUNTS = [25, 50, 100, 250, 500]

export default function DonationForm() {
  const [frequency, setFrequency] = useState<'ONE_TIME' | 'MONTHLY' | 'ANNUAL'>('ONE_TIME')
  const [amountType, setAmountType] = useState<'preset' | 'custom'>('preset')
  const [preset, setPreset] = useState<number>(100)
  const [custom, setCustom] = useState<string>('')
  const [anonymous, setAnonymous] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [apiMsg, setApiMsg] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; amount?: string }>({})

  const selectedAmount = amountType === 'preset' ? preset : parseFloat(custom)

  const validate = () => {
    const errs: typeof errors = {}
    if (!selectedAmount || isNaN(selectedAmount) || selectedAmount <= 0) {
      errs.amount = 'Please select or enter a valid donation amount'
    }
    if (!anonymous && !name.trim()) errs.name = 'Please enter your name (or donate anonymously)'
    if (!anonymous && !email.trim()) errs.email = 'Please enter your email'
    else if (!anonymous && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setApiMsg('')

    const res = await fetch('/api/donations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:      selectedAmount,
        frequency,
        donorName:   anonymous ? 'Anonymous' : name.trim(),
        donorEmail:  anonymous ? 'anonymous@donor.local' : email.trim(),
        message:     message.trim() || undefined,
        anonymous,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setApiMsg(data.error ?? 'Something went wrong. Please try again.')
      setStatus('error')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="bg-light-sage border border-soft-sage rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h3 className="text-2xl font-bold text-forest-dark mb-3">Thank You!</h3>
        <p className="text-text-muted mb-4">
          Your donation intent has been recorded. Our payment system is being set up —
          we will reach out to complete the donation once it is available.
        </p>
        <p className="text-xs text-text-muted">
          If you would like to donate immediately, please{' '}
          <a href="/contact" className="text-forest hover:text-moss underline">contact us directly</a>.
        </p>
      </div>
    )
  }

  const btnFreq = (val: typeof frequency, label: string) => (
    <button
      type="button"
      onClick={() => setFrequency(val)}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        frequency === val
          ? 'bg-forest text-white shadow-sm'
          : 'bg-white border border-soft-sage text-text-muted hover:border-forest hover:text-forest'
      }`}
    >
      {label}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Payment-provider notice */}
      <div className="bg-light-sage border border-soft-sage rounded-xl px-5 py-4 text-sm text-forest-dark">
        🌱 <strong>Environmental Support:</strong> You can submit your donation intent now, and our team will contact you with secure options —
        or <a href="/contact" className="underline font-semibold hover:text-moss">reach out directly</a>.
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl" role="alert">
          {apiMsg}
        </div>
      )}

      {/* Frequency */}
      <div>
        <p className="text-sm font-semibold text-forest-dark mb-3">Donation Frequency</p>
        <div className="flex gap-2">
          {btnFreq('ONE_TIME', 'One-Time')}
          {btnFreq('MONTHLY',  'Monthly')}
          {btnFreq('ANNUAL',   'Annual')}
        </div>
      </div>

      {/* Amount selection */}
      <div>
        <p className="text-sm font-semibold text-forest-dark mb-3">Amount (CAD)</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => { setAmountType('preset'); setPreset(amt) }}
              className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                amountType === 'preset' && preset === amt
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white border border-soft-sage text-text-dark hover:border-forest hover:text-forest'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">$</span>
          <input
            type="number"
            value={amountType === 'custom' ? custom : ''}
            onChange={(e) => {
              setAmountType('custom')
              setCustom(e.target.value)
              setErrors((p) => ({ ...p, amount: '' }))
            }}
            onFocus={() => setAmountType('custom')}
            placeholder="Other amount"
            min="1"
            step="any"
            className={`w-full pl-9 pr-4 py-3 border rounded-xl text-ink text-sm
              focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent
              placeholder:text-text-muted ${
                errors.amount
                  ? 'border-red-400 bg-red-50'
                  : amountType === 'custom' ? 'border-forest bg-white' : 'border-soft-sage'
              }`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
      </div>

      {/* Anonymous toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="w-4 h-4 rounded border-soft-sage text-forest focus:ring-moss"
        />
        <span className="text-sm font-medium text-text-dark">Donate anonymously</span>
      </label>

      {/* Donor info (if not anonymous) */}
      {!anonymous && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="df-name" className="block text-sm font-semibold text-forest-dark mb-2">Name</label>
            <input
              id="df-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-soft-sage'
              }`}
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="df-email" className="block text-sm font-semibold text-forest-dark mb-2">Email</label>
            <input
              id="df-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-soft-sage'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="df-msg" className="block text-sm font-semibold text-forest-dark mb-2">
          Message or Dedication <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="df-msg"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border border-soft-sage rounded-xl text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent placeholder:text-text-muted"
          placeholder="Leave a message with your gift…"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === 'loading'}
        className="w-full justify-center"
      >
        {status === 'loading'
          ? 'Processing…'
          : `Submit Intent to Donate ${selectedAmount ? `$${selectedAmount}` : ''}`
        }
      </Button>
    </form>
  )
}
