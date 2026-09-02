'use client'
// ─── Public Header Component ────────────────────────────────────────────────
// Refined navigation bar with dark mode support, mobile drawer, and ThemeToggle.

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useVolunteerModal } from '@/context/VolunteerModalContext'

const navItems = [
  { label: 'About Us',     href: '/#about' },
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
  const { openVolunteerModal } = useVolunteerModal()

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

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-[#FCFBF6]/94 dark:bg-[#0B1628]/95 backdrop-blur-md border-b border-[#DDE3DA]/80 dark:border-[#1E3A5F] ${
          isScrolled
            ? 'shadow-[0_2px_10px_rgba(16,45,89,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
            : 'shadow-[0_1px_3px_rgba(16,45,89,0.02)]'
        }`}
        role="banner"
      >
        <div className="container-boc">
          {/* Header height: 56px mobile (h-14), 64px tablet (h-16), 68px desktop (h-[68px]) */}
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[68px]">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center shrink-0 focus-visible:ring-2 focus-visible:ring-brand-navy dark:focus-visible:ring-brand-cyan focus-visible:ring-offset-2 rounded-lg py-0.5"
              aria-label="Bridge of Compassion — Home"
            >
              <div className="relative w-36 h-8 sm:w-44 sm:h-9 lg:w-48 lg:h-9 dark:bg-white/95 dark:rounded-lg dark:px-1.5 dark:py-0.5 transition-colors">
                <Image
                  src="/images/bridgeofcompassion-logo.png"
                  alt="Bridge of Compassion logo"
                  fill
                  className="object-contain object-left dark:p-0.5"
                  priority
                  sizes="(max-width: 768px) 180px, 210px"
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
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-brand-navy dark:text-brand-cyan bg-brand-sky/60 dark:bg-dark-card font-semibold'
                      : 'text-brand-navy/85 dark:text-dark-text-primary/90 hover:text-brand-green dark:hover:text-brand-cyan hover:bg-brand-sage/20 dark:hover:bg-dark-card/60'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTA Buttons & Theme Toggle ───────────────────── */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="secondary"
                size="sm"
                onClick={openVolunteerModal}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Volunteer
              </Button>
              <Button
                href="/donate"
                variant="primary"
                size="sm"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-2xs"
              >
                Donate
              </Button>
            </div>

            {/* ── Mobile: Theme + Donate + Hamburger ───────────────────── */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <ThemeToggle />
              <Button href="/donate" variant="primary" size="sm" className="px-3 py-1 text-xs font-semibold rounded-lg">
                Donate
              </Button>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-1.5 rounded-lg text-brand-navy dark:text-dark-text-primary hover:bg-brand-sky/60 dark:hover:bg-dark-card transition-colors"
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
          className="absolute inset-0 bg-brand-navy-dark/50 backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close menu"
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-72 sm:w-80 bg-brand-warm-white dark:bg-dark-surface border-l border-border-soft dark:border-dark-border shadow-2xl flex flex-col
                      transition-transform duration-300 ease-out
                      ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-border-soft dark:border-dark-border">
            <div className="relative w-36 h-8 sm:w-40 sm:h-9 dark:bg-white/95 dark:rounded-lg dark:px-1.5 dark:py-0.5">
              <Image
                src="/images/bridgeofcompassion-logo.png"
                alt="Bridge of Compassion"
                fill
                className="object-contain object-left dark:p-0.5"
                sizes="160px"
              />
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-brand-sage/40 dark:hover:bg-dark-card transition-colors"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-brand-navy dark:text-brand-cyan bg-brand-sky/60 dark:bg-dark-card font-semibold'
                    : 'text-brand-navy dark:text-dark-text-primary hover:text-brand-green dark:hover:text-brand-cyan hover:bg-brand-sage/20 dark:hover:bg-dark-card/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Panel CTA buttons */}
          <div className="p-4 border-t border-border-soft dark:border-dark-border space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsMobileOpen(false)
                openVolunteerModal()
              }}
              className="w-full justify-center text-xs font-semibold rounded-lg cursor-pointer"
            >
              Volunteer With Us
            </Button>
            <Button href="/donate" variant="primary" size="sm" className="w-full justify-center text-xs font-semibold rounded-lg">
              Donate
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
