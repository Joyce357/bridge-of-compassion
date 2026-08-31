'use client'

import { useState } from 'react'

interface NewsletterFormProps {
  className?: string
  inputClassName?: string
  buttonClassName?: string
}

export default function NewsletterForm({
  className = 'flex flex-col sm:flex-row w-full md:w-auto gap-2.5',
  inputClassName = 'flex-1 md:w-64 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-brand-warm-white placeholder-white/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all',
  buttonClassName = 'bg-brand-green hover:bg-brand-leaf text-brand-warm-white font-semibold px-4 sm:px-5 py-2.5 text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setStatus('error')
      setMessage('Please enter your email address.')
      return
    }

    // Basic client validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Thank you for subscribing to our newsletter!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="w-full md:w-auto">
      {status === 'success' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green/20 border border-brand-green/40 text-brand-cyan text-xs sm:text-sm font-medium animate-fadeIn"
        >
          <span className="text-base">✓</span>
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="ml-auto text-white/60 hover:text-white text-xs underline focus:outline-none"
            aria-label="Subscribe another email"
          >
            Add another
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={className}
          aria-label="Newsletter subscription form"
          noValidate
        >
          <label htmlFor="newsletter-footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-footer-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder="Your email address"
            autoComplete="email"
            required
            disabled={status === 'loading'}
            aria-required="true"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'newsletter-error-msg' : undefined}
            className={inputClassName}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={buttonClassName}
          >
            {status === 'loading' ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Subscribing...</span>
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p
          id="newsletter-error-msg"
          role="alert"
          className="mt-1.5 text-xs text-rose-300 font-medium"
        >
          {message}
        </p>
      )}
    </div>
  )
}
