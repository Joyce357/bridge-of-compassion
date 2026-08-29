'use client'

import Image from 'next/image'
import Link from 'next/link'

const footerNav = {
  organization: [
    { label: 'About Us',       href: '/about' },
    { label: 'Our Mission',    href: '/about#mission' },
    { label: 'Leadership',     href: '/about#team' },
    { label: 'News & Stories', href: '/news' },
    { label: 'Contact',        href: '/contact' },
  ],
  programs: [
    { label: 'Outdoor Learning',            href: '/programs#outdoor-learning' },
    { label: 'Community Action & Cleanups', href: '/programs#community-action' },
    { label: 'Youth Environmental Leadership', href: '/programs#youth-leadership' },
    { label: 'Tree Planting & Biodiversity', href: '/programs#tree-planting' },
    { label: 'All Programs',               href: '/programs' },
  ],
  getInvolved: [
    { label: 'Volunteer With Us', href: '/volunteer' },
    { label: 'Make a Donation',   href: '/donate' },
    { label: 'Upcoming Events',   href: '/events' },
    { label: 'Partner With Us',   href: '/get-involved#partner' },
    { label: 'Photo Gallery',     href: '/gallery' },
  ],
  legal: [
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Use',     href: '/terms' },
    { label: 'Accessibility',    href: '/accessibility' },
  ],
}

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-brand-navy-dark text-brand-warm-white" role="contentinfo">

      {/* ── Newsletter bar ────────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container-boc py-5 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div>
              <h3 className="text-brand-warm-white text-base sm:text-lg font-bold mb-0.5">
                Stay Connected with Nature &amp; Community
              </h3>
              <p className="text-brand-warm-white/70 text-xs sm:text-sm">
                Receive updates on our environmental programs, youth workshops, and events.
              </p>
            </div>
            <form
              className="flex w-full md:w-auto gap-2.5"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                required
                className="flex-1 md:w-60 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-brand-warm-white placeholder-white/50 text-xs sm:text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-leaf text-brand-warm-white font-semibold px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap shadow-xs"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer content ───────────────────────────────────────── */}
      <div className="container-boc py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand column (4 cols) */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center mb-3.5 focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-lg"
              aria-label="Bridge of Compassion home"
            >
              <div className="relative w-44 h-12 bg-white/95 rounded-xl p-1.5 shadow-xs">
                <Image
                  src="/images/bridgeofcompassion-logo.png"
                  alt="Bridge of Compassion"
                  fill
                  className="object-contain p-0.5"
                  sizes="180px"
                />
              </div>
            </Link>

            <p className="text-brand-warm-white/75 text-xs sm:text-sm leading-relaxed mb-3.5 max-w-xs">
              Nurturing children, protecting nature, and building futures through hands-on environmental education and community action.
            </p>

            {/* Contact */}
            <address className="not-italic text-xs sm:text-sm text-brand-warm-white/65 space-y-1 mb-3.5">
              <p>📍 Toronto, Ontario</p>
              <p>✉️ <a href="mailto:admin@bridgeofcompassion.org" className="text-brand-cyan hover:text-brand-warm-white transition-colors">admin@bridgeofcompassion.org</a></p>
            </address>

            {/* Social links */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={`Follow us on ${social.name}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10
                             text-brand-warm-white/80 hover:bg-brand-cyan hover:text-brand-navy-dark
                             transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav column 1: Organization (2 cols) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-brand-warm-white text-xs font-bold tracking-widest uppercase mb-3 text-brand-cyan">
              Organization
            </h4>
            <ul className="space-y-2">
              {footerNav.organization.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-brand-warm-white/70 text-xs sm:text-sm hover:text-brand-cyan transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav column 2: Programs (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-brand-warm-white text-xs font-bold tracking-widest uppercase mb-3 text-brand-cyan">
              Programs
            </h4>
            <ul className="space-y-2">
              {footerNav.programs.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-brand-warm-white/70 text-xs sm:text-sm hover:text-brand-cyan transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav column 3: Get Involved (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-brand-warm-white text-xs font-bold tracking-widest uppercase mb-3 text-brand-cyan">
              Get Involved
            </h4>
            <ul className="space-y-2">
              {footerNav.getInvolved.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-brand-warm-white/70 text-xs sm:text-sm hover:text-brand-cyan transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-warm-white/50">
          <p>© {new Date().getFullYear()} Bridge of Compassion. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {footerNav.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-brand-cyan transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

    </footer>
  )
}
