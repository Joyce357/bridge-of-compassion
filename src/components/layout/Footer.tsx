// ─── Footer Component (Server Component) ───────────────────────────────────
// Renders global navigation, newsletter signup, and dynamic organization contact & social links from SiteSettings.

import Image from 'next/image'
import Link from 'next/link'
import NewsletterForm from '@/components/layout/NewsletterForm'
import { getSiteSettings } from '@/lib/settings'

const footerNav = {
  organization: [
    { label: 'About Us',       href: '/about' },
    { label: 'Our Mission',    href: '/about#mission' },
    { label: 'Leadership',     href: '/about#team' },
    { label: 'News & Stories', href: '/news' },
    { label: 'Contact',        href: '/contact' },
  ],
  programs: [
    { label: 'Outdoor Learning',               href: '/programs#outdoor-learning' },
    { label: 'Community Action & Cleanups',    href: '/programs#community-action' },
    { label: 'Youth Environmental Leadership', href: '/programs#youth-leadership' },
    { label: 'Tree Planting & Biodiversity',   href: '/programs#tree-planting' },
    { label: 'All Programs',                  href: '/programs' },
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

export default async function Footer() {
  const settings = await getSiteSettings()

  // Collect configured social links only (never show "#" or generic homepages if unconfigured)
  const activeSocialLinks = [
    settings.facebookUrl?.trim() ? {
      name: 'Facebook',
      href: settings.facebookUrl.trim(),
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    } : null,
    settings.instagramUrl?.trim() ? {
      name: 'Instagram',
      href: settings.instagramUrl.trim(),
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    } : null,
    settings.linkedinUrl?.trim() ? {
      name: 'LinkedIn',
      href: settings.linkedinUrl.trim(),
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    } : null,
    settings.youtubeUrl?.trim() ? {
      name: 'YouTube',
      href: settings.youtubeUrl.trim(),
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    } : null,
  ].filter(Boolean) as { name: string; href: string; icon: React.ReactNode }[]

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
            <NewsletterForm />
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
              aria-label={`${settings.organizationName} home`}
            >
              <div className="relative w-44 h-12 bg-white/95 rounded-xl p-1.5 shadow-xs">
                <Image
                  src="/images/bridgeofcompassion-logo.png"
                  alt={settings.organizationName}
                  fill
                  className="object-contain p-0.5"
                  sizes="180px"
                />
              </div>
            </Link>

            <p className="text-brand-warm-white/75 text-xs sm:text-sm leading-relaxed mb-3.5 max-w-xs">
              {settings.footerTagline || 'Nurturing children, protecting nature, and building futures through hands-on environmental education and community action.'}
            </p>

            {/* Contact */}
            <address className="not-italic text-xs sm:text-sm text-brand-warm-white/65 space-y-1 mb-3.5">
              {settings.publicLocationLabel && (
                <p>📍 {settings.publicLocationLabel}</p>
              )}
              {settings.phone && (
                <p>📞 <a href={`tel:${settings.phone}`} className="text-brand-cyan hover:text-brand-warm-white transition-colors">{settings.phone}</a></p>
              )}
              {settings.publicEmail && (
                <p>✉️ <a href={`mailto:${settings.publicEmail}`} className="text-brand-cyan hover:text-brand-warm-white transition-colors">{settings.publicEmail}</a></p>
              )}
            </address>

            {/* Social links (only shown if configured) */}
            {activeSocialLinks.length > 0 && (
              <div className="flex items-center gap-2.5">
                {activeSocialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10
                               text-brand-warm-white/80 hover:bg-brand-cyan hover:text-brand-navy-dark
                               transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
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
          <p>© {new Date().getFullYear()} {settings.organizationName}. All rights reserved.</p>
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
