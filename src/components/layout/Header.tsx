'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'

const navItems = [
  { label: 'About Us',     href: '/about' },
  { label: 'Programs',     href: '/programs' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'Events',       href: '/events' },
  { label: 'News',         href: '/news' },
  { label: 'Contact',      href: '/contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled]     = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Detect scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-[#FCFBF6]/92 backdrop-blur-[12px] border-b border-[#DDE3DA]/80 ${
          isScrolled
            ? 'shadow-[0_2px_12px_rgba(16,45,89,0.05)]'
            : 'shadow-[0_1px_4px_rgba(16,45,89,0.02)]'
        }`}
        role="banner"
      >
        <div className="container-boc">
          {/* Header height: 64px mobile, 70px tablet, 76px desktop */}
          <div className="flex items-center justify-between h-16 sm:h-[70px] lg:h-[76px]">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center shrink-0 focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 rounded-lg py-1"
              aria-label="Bridge of Compassion — Home"
            >
              <div className="relative w-44 h-10 sm:w-52 sm:h-11 lg:w-56 lg:h-12">
                <Image
                  src="/images/bridgeofcompassion-logo.png"
                  alt="Bridge of Compassion logo"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="(max-width: 768px) 200px, 240px"
                />
              </div>
            </Link>

            {/* ── Desktop Navigation ───────────────────────────────────── */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-brand-navy bg-brand-sky/60 font-semibold'
                      : 'text-brand-navy/85 hover:text-brand-green hover:bg-brand-sage/20'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTA (Target: 44-46px height, 18-24px padding, 10-12px radius) ────────────────────── */}
            <div className="hidden lg:flex items-center gap-2.5">
              <Button href="/volunteer" variant="secondary" size="sm" className="h-11 px-5 text-xs font-semibold rounded-xl">
                Volunteer
              </Button>
              <Button href="/donate" variant="primary" size="sm" className="h-11 px-5 text-xs font-semibold rounded-xl shadow-xs">
                Donate
              </Button>
            </div>

            {/* ── Mobile: Donate + Hamburger ───────────────────────────── */}
            <div className="flex lg:hidden items-center gap-2 sm:gap-2.5">
              <Button href="/donate" variant="primary" size="sm" className="h-10 px-4 text-xs font-semibold rounded-xl">
                Donate
              </Button>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 rounded-lg text-brand-navy hover:bg-brand-sky transition-colors duration-200"
                aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">
                  {isMobileOpen ? 'Close menu' : 'Open menu'}
                </span>
                {/* Animated hamburger icon */}
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${
                      isMobileOpen ? 'rotate-45 translate-y-1.5' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${
                      isMobileOpen ? 'opacity-0 scale-x-0' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${
                      isMobileOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ───────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-brand-navy-dark/50"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close menu"
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-80 bg-brand-warm-white shadow-2xl flex flex-col
                      transition-transform duration-300 ease-out
                      ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 h-16 sm:h-[70px] border-b border-border-soft">
            <div className="relative w-44 h-10">
              <Image
                src="/images/bridgeofcompassion-logo.png"
                alt="Bridge of Compassion"
                fill
                className="object-contain object-left"
                sizes="180px"
              />
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg text-text-secondary hover:bg-brand-sage/40 transition-colors"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-brand-navy bg-brand-sky font-semibold'
                    : 'text-brand-navy hover:text-brand-green hover:bg-brand-sage/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Panel CTA buttons */}
          <div className="p-5 border-t border-border-soft space-y-2.5">
            <Button href="/volunteer" variant="secondary" className="w-full justify-center h-10 text-xs font-semibold rounded-xl">
              Volunteer With Us
            </Button>
            <Button href="/donate" variant="primary" className="w-full justify-center h-10 text-xs font-semibold rounded-xl">
              Donate
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
