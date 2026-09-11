'use client'
// ─── Public Donation Form Component ──────────────────────────────────────────
// Backed by PayPal Sandbox / Live server-authoritative order and capture flow.
// Strictly one-time donations in this phase. Required donor email for receipts.

import { useState, useEffect, useRef, useCallback } from 'react'

import { DONATION_PRESET_AMOUNTS, DEFAULT_DONATION_CURRENCY } from '@/lib/validations'

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, unknown>
        createOrder: () => Promise<string>
        onApprove: (data: { orderID: string }) => Promise<void>
        onError: (err: unknown) => void
        onCancel: () => void
      }) => {
        render: (container: HTMLElement | string) => Promise<void>
      }
    }
  }
}

export default function DonationForm() {
  const [amountType, setAmountType] = useState<'preset' | 'custom'>('preset')
  const [preset, setPreset] = useState<number>(100)
  const [custom, setCustom] = useState<string>('')
  const [anonymous, setAnonymous] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; amount?: string }>({})
  
  // Payment states
  const [status, setStatus] = useState<'idle' | 'preparing' | 'processing' | 'success' | 'error' | 'cancelled'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [completedDetails, setCompletedDetails] = useState<{
    donationId?: string
    captureId?: string
    amount?: number
    currency?: string
    donorName?: string
    receiptSent?: boolean
  } | null>(null)


  const [sdkReady, setSdkReady] = useState(false)
  const paypalContainerRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const selectedAmount = amountType === 'preset' ? preset : parseFloat(custom)

  // Validate form client-side before initiating PayPal order
  const validateForm = useCallback((): boolean => {
    const errs: typeof formErrors = {}

    if (!selectedAmount || isNaN(selectedAmount) || selectedAmount < 1) {
      errs.amount = 'Please select or enter a donation amount of at least $1.'
    } else if (selectedAmount > 100000) {
      errs.amount = 'For donations over $100,000, please contact our team directly.'
    }

    if (!anonymous && !name.trim()) {
      errs.name = 'Please enter your name, or check the box to donate anonymously.'
    }

    if (!email.trim()) {
      errs.email = 'Email address is required for donation acknowledgement & receipt.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }, [selectedAmount, anonymous, name, email])


  // Load PayPal SDK script if client ID is configured
  useEffect(() => {
    if (!clientId) {
      return
    }

    if (window.paypal) {
      setSdkReady(true)
      return
    }

    const scriptId = 'paypal-sdk-script'
    if (document.getElementById(scriptId)) {
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${DEFAULT_DONATION_CURRENCY}&intent=capture&components=buttons`
    script.async = true
    script.onload = () => {
      setSdkReady(true)
    }
    script.onerror = () => {
      console.error('[PayPal SDK] Failed to load PayPal JavaScript SDK.')
      setErrorMessage('Could not load PayPal payment gateway. Please refresh the page.')
    }
    document.body.appendChild(script)
  }, [clientId])

  // Render PayPal Buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalContainerRef.current) return

    // Clear previous button render
    paypalContainerRef.current.innerHTML = ''

    try {
      const button = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'donate',
          height: 48,
        },
        createOrder: async () => {
          setErrorMessage('')
          if (!validateForm()) {
            throw new Error('Please complete the required form fields above.')
          }

          setStatus('preparing')

          const res = await fetch('/api/donations/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: selectedAmount,
              currency: DEFAULT_DONATION_CURRENCY,
              donorName: anonymous ? null : name.trim(),
              donorEmail: email.trim(),
              message: message.trim() || null,
              isAnonymous: anonymous,
              frequency: 'ONE_TIME',
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            setStatus('error')
            const msg = data.error || 'Failed to initialize payment session.'
            setErrorMessage(msg)
            throw new Error(msg)
          }

          // Store temporary donation and order IDs for capture or cancellation
          sessionStorage.setItem('pending_boc_donation_id', data.donationId)
          sessionStorage.setItem('pending_boc_order_id', data.orderId)
          setStatus('idle')
          return data.orderId
        },
        onApprove: async (data) => {
          setStatus('processing')
          setErrorMessage('')

          const donationId = sessionStorage.getItem('pending_boc_donation_id') || ''

          try {
            const captureRes = await fetch('/api/donations/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderID,
                donationId,
              }),
            })

            const captureData = await captureRes.json()

            if (!captureRes.ok || !captureData.success) {
              setStatus('error')
              setErrorMessage(captureData.error || 'Payment verification was unsuccessful.')
              return
            }

            sessionStorage.removeItem('pending_boc_donation_id')
            sessionStorage.removeItem('pending_boc_order_id')
            setCompletedDetails({
              donationId: captureData.donationId,
              captureId: captureData.captureId,
              amount: selectedAmount,
              currency: DEFAULT_DONATION_CURRENCY,
              donorName: anonymous ? 'Valued Supporter' : name.trim(),
              receiptSent: Boolean(captureData.receiptSent),
            })
            setStatus('success')
          } catch (err) {
            console.error('[Donation Capture] Error:', err)
            setStatus('error')
            setErrorMessage('Payment verification timed out. Please contact us to confirm your receipt.')
          }
        },
        onError: (err) => {
          console.error('[PayPal Button] Client error:', err)
          setStatus('error')
          setErrorMessage('Payment could not be processed. Please check your details or try again.')
        },
        onCancel: async () => {
          setStatus('cancelled')
          const donationId = sessionStorage.getItem('pending_boc_donation_id')
          const orderId = sessionStorage.getItem('pending_boc_order_id')

          if (donationId && orderId) {
            try {
              await fetch('/api/donations/cancel-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donationId, orderId }),
              })
            } catch (cancelErr) {
              console.warn('[Donation Cancel] Failed to notify server of cancellation:', cancelErr)
            } finally {
              sessionStorage.removeItem('pending_boc_donation_id')
              sessionStorage.removeItem('pending_boc_order_id')
            }
          }
        },
      })


      button.render(paypalContainerRef.current)
    } catch (renderErr) {
      console.error('[PayPal Render] Error:', renderErr)
    }
  }, [sdkReady, selectedAmount, anonymous, name, email, message, validateForm])


  // ── Success State ──────────────────────────────────────────────────────────
  if (status === 'success' && completedDetails) {
    return (
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
          💚
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy dark:text-dark-text-primary mb-2">
          Thank You for Your Compassion!
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
          Your gift of <strong>{completedDetails.currency} ${completedDetails.amount?.toFixed(2)}</strong> has been successfully received and confirmed.
        </p>

        <div className="bg-brand-warm-white dark:bg-dark-surface border border-border-soft dark:border-dark-border rounded-xl p-5 max-w-md mx-auto text-left text-xs sm:text-sm space-y-2 mb-6">
          <div className="flex justify-between text-text-secondary dark:text-dark-text-secondary">
            <span>Reference ID:</span>
            <span className="font-mono font-semibold text-brand-navy dark:text-dark-text-primary">{completedDetails.captureId || completedDetails.donationId}</span>
          </div>
          <div className="flex justify-between text-text-secondary dark:text-dark-text-secondary">
            <span>Payment Method:</span>
            <span className="font-semibold text-brand-navy dark:text-dark-text-primary">PayPal</span>
          </div>
          <div className="flex justify-between text-text-secondary dark:text-dark-text-secondary">
            <span>Receipt Destination:</span>
            <span className="font-semibold text-brand-navy dark:text-dark-text-primary truncate max-w-[200px]">{email}</span>
          </div>
        </div>

        <p className="text-xs text-text-secondary/80 dark:text-dark-text-secondary/80 max-w-md mx-auto mb-6 leading-relaxed">
          {completedDetails.receiptSent
            ? 'A donation acknowledgement receipt has been sent to your email.'
            : 'Your donation was successfully received. Your donation acknowledgement email is pending.'}
          <br />
          <em>This acknowledgement confirms your payment and is not represented as an official charitable tax receipt.</em>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus('idle')
              setCompletedDetails(null)
              setName('')
              setEmail('')
              setMessage('')
              setCustom('')
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-green dark:bg-brand-cyan text-brand-warm-white dark:text-brand-navy-dark font-semibold text-sm hover:bg-brand-green/90 dark:hover:bg-brand-cyan/90 transition-all shadow-sm cursor-pointer"
          >
            Make Another Donation
          </button>
          <a
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-warm-white dark:bg-dark-surface border border-border-soft dark:border-dark-border text-brand-navy dark:text-dark-text-primary font-semibold text-sm hover:bg-brand-cream/40 dark:hover:bg-dark-card transition-all"
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sandbox / Configuration Notice if credentials are not configured */}
      {!clientId && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300" role="status">
          <p className="font-semibold mb-1">🌱 PayPal Sandbox Development Setup</p>
          <p className="text-amber-700 dark:text-amber-400">
            Payment gateway configuration is in progress. To enable live PayPal Sandbox buttons in development, set <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> and server secrets in <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">.env.local</code>.
          </p>
        </div>
      )}

      {/* Frequency Header — One-Time Only */}
      <div>
        <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-2">
          Gift Frequency
        </label>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cream/60 dark:bg-dark-surface border border-border-soft dark:border-dark-border text-brand-navy dark:text-dark-text-primary text-sm font-semibold">
          <span>✨ One-Time Gift</span>
        </div>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
          Development default currency: <strong>CAD</strong>
        </p>
      </div>

      {/* Preset / Custom Amount Selection */}
      <div>
        <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-2">
          Select Amount ({DEFAULT_DONATION_CURRENCY})
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {DONATION_PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setAmountType('preset')
                setPreset(amt)
                setFormErrors((prev) => ({ ...prev, amount: '' }))
              }}
              className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                amountType === 'preset' && preset === amt
                  ? 'bg-brand-green dark:bg-brand-cyan text-brand-warm-white dark:text-brand-navy-dark shadow-sm ring-2 ring-brand-green/30 dark:ring-brand-cyan/30'
                  : 'bg-brand-warm-white dark:bg-dark-surface border border-border-soft dark:border-dark-border text-brand-navy dark:text-dark-text-primary hover:border-brand-green dark:hover:border-brand-cyan hover:bg-[#F8FAF6] dark:hover:bg-dark-card'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary font-semibold">$</span>
          <input
            id="donation-custom-amount"
            type="number"
            value={amountType === 'custom' ? custom : ''}
            onChange={(e) => {
              setAmountType('custom')
              setCustom(e.target.value)
              setFormErrors((prev) => ({ ...prev, amount: '' }))
            }}
            onFocus={() => setAmountType('custom')}
            placeholder="Custom amount (e.g. 75)"
            min="1"
            max="100000"
            step="any"
            aria-label="Custom donation amount in CAD"
            className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-brand-navy dark:text-dark-text-primary text-sm bg-white dark:bg-dark-surface shadow-2xs
              focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan
              placeholder:text-text-secondary/60 dark:placeholder:text-dark-text-secondary/50 ${
                formErrors.amount
                  ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-400'
                  : amountType === 'custom'
                    ? 'border-brand-green dark:border-brand-cyan ring-1 ring-brand-green dark:ring-brand-cyan'
                    : 'border-border-soft dark:border-dark-border'
              }`}
          />
        </div>
        {formErrors.amount && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
            {formErrors.amount}
          </p>
        )}
      </div>

      {/* Anonymous Checkbox */}
      <div className="bg-[#F8FAF6] dark:bg-dark-surface p-3.5 rounded-xl border border-border-soft dark:border-dark-border">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => {
              setAnonymous(e.target.checked)
              if (e.target.checked) {
                setFormErrors((prev) => ({ ...prev, name: '' }))
              }
            }}
            className="w-4 h-4 mt-0.5 rounded border-border-soft dark:border-dark-border text-brand-green focus:ring-brand-green"
          />
          <div>
            <span className="text-xs sm:text-sm font-semibold text-brand-navy dark:text-dark-text-primary">Make this donation anonymous</span>
            <p className="text-[11px] sm:text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
              Your name will not be published or displayed publicly. Your email is required and kept private for receipt delivery.
            </p>
          </div>
        </label>
      </div>

      {/* Donor Contact Fields */}
      <div className="space-y-4">
        {!anonymous && (
          <div>
            <label htmlFor="donation-donor-name" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="donation-donor-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setFormErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="e.g. Jane Doe"
              className={`w-full px-4 py-2.5 border rounded-xl text-brand-navy dark:text-dark-text-primary text-sm bg-white dark:bg-dark-surface shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan ${
                formErrors.name ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-border-soft dark:border-dark-border'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
                {formErrors.name}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="donation-donor-email" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
            Email Address (Required for Receipt) <span className="text-red-500">*</span>
          </label>
          <input
            id="donation-donor-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFormErrors((prev) => ({ ...prev, email: '' }))
            }}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 border rounded-xl text-brand-navy dark:text-dark-text-primary text-sm bg-white dark:bg-dark-surface shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan ${
              formErrors.email ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-border-soft dark:border-dark-border'
            }`}
          />
          {formErrors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
              {formErrors.email}
            </p>
          )}
          <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary mt-1">
            We will email your official payment acknowledgement directly to this address.
          </p>
        </div>

        {/* Dedication / Message */}
        <div>
          <label htmlFor="donation-message" className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
            Optional Note or Dedication
          </label>
          <textarea
            id="donation-message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message or dedication with your gift…"
            className="w-full px-4 py-2.5 border border-border-soft dark:border-dark-border rounded-xl text-brand-navy dark:text-dark-text-primary text-sm bg-white dark:bg-dark-surface shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan placeholder:text-text-secondary/60 dark:placeholder:text-dark-text-secondary/50"
          />
        </div>
      </div>

      {/* Error and Status Alerts */}
      {status === 'error' && errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs sm:text-sm px-4 py-3 rounded-xl" role="alert">
          {errorMessage}
        </div>
      )}

      {status === 'cancelled' && (
        <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm px-4 py-3 rounded-xl" role="status">
          Donation checkout was cancelled. You can adjust your amount or details and try again whenever you are ready.
        </div>
      )}

      {/* PayPal Button Container or Pending Configuration */}
      <div className="pt-2">
        <div className="mb-2 text-center">
          <span className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
            Total Gift: <strong className="text-brand-navy dark:text-dark-text-primary">{DEFAULT_DONATION_CURRENCY} ${selectedAmount ? selectedAmount.toFixed(2) : '0.00'}</strong>
          </span>
        </div>

        {clientId ? (
          <div>
            {status === 'processing' ? (
              <div className="py-8 text-center bg-[#F8FAF6] dark:bg-dark-surface border border-border-soft dark:border-dark-border rounded-xl">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-brand-green dark:border-brand-cyan border-t-transparent rounded-full mb-3" />
                <p className="text-sm font-semibold text-brand-navy dark:text-dark-text-primary">Confirming your transaction with PayPal…</p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Please do not close this window.</p>
              </div>
            ) : (
              <div ref={paypalContainerRef} className="min-h-[50px] relative z-0" />
            )}
          </div>
        ) : (
          <div className="text-center py-4 px-6 bg-brand-cream/40 dark:bg-dark-surface border border-border-soft dark:border-dark-border rounded-xl text-xs text-text-secondary dark:text-dark-text-secondary">
            <p className="font-semibold text-brand-navy dark:text-dark-text-primary mb-1">Secure Payment via PayPal</p>
            <p>
              PayPal button will activate automatically once Sandbox client credentials are configured.
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-center text-text-secondary/70 dark:text-dark-text-secondary/70">
        🔒 Transactions are securely processed through PayPal. Your sensitive financial credentials are never stored on our servers.
      </p>
    </div>
  )
}
