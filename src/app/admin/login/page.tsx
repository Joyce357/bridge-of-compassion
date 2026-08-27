'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl') ?? '/admin'
  const callbackUrl = rawCallbackUrl.startsWith('/admin/login') ? '/admin' : rawCallbackUrl

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (res?.error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Card */}
      <div className="bg-brand-warm-white rounded-3xl shadow-2xl overflow-hidden border border-border-soft">
        {/* Header */}
        <div className="bg-brand-navy px-8 py-8 text-center border-b border-brand-navy-dark">
          <div className="relative w-44 h-14 mx-auto bg-white/95 rounded-xl p-1.5 shadow-sm mb-4">
            <Image
              src="/images/bridgeofcompassion-logo.png"
              alt="Bridge of Compassion"
              fill
              className="object-contain p-1"
              sizes="180px"
            />
          </div>
          <h1 className="text-brand-warm-white text-lg font-bold">Admin Portal</h1>
          <p className="text-brand-cyan text-xs mt-0.5 font-semibold tracking-wider uppercase">Environmental Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" noValidate>
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-brand-navy mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-border-soft rounded-xl text-text-primary text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent
                         transition-all duration-200 placeholder:text-text-secondary/60 bg-white"
              placeholder="admin@bridgeofcompassion.org"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-brand-navy mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-border-soft rounded-xl text-text-primary text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent
                         transition-all duration-200 placeholder:text-text-secondary/60 bg-white"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="environmental"
            disabled={loading}
            className="w-full justify-center shadow-md"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 text-center border-t border-border-soft/60 pt-4">
          <Link
            href="/"
            className="text-xs text-brand-green hover:text-brand-navy font-semibold transition-colors"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-brand-navy-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-brand-warm-white p-8 rounded-3xl text-center">
          <p className="text-brand-navy font-bold">Loading Admin Portal…</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
