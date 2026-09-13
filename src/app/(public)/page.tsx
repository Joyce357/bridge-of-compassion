import type { Metadata } from 'next'
import Hero           from '@/components/home/Hero'
import WhoWeAre       from '@/components/home/WhoWeAre'
import ImpactStats    from '@/components/home/ImpactStats'
import ProgramsPreview from '@/components/home/ProgramsPreview'
import WhyBridge      from '@/components/home/WhyBridge'
import GetInvolved    from '@/components/home/GetInvolved'
import StoriesPreview  from '@/components/home/StoriesPreview'
import EventsPreview   from '@/components/home/EventsPreview'
import FinalCTA        from '@/components/home/FinalCTA'
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo'
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings'

export const metadata: Metadata = {
  // Absolute title — does not use the template ('%s | Bridge of Compassion') so it
  // matches the confirmed SiteSettings seoTitle exactly on the homepage.
  title: {
    absolute: DEFAULT_SITE_SETTINGS.seoTitle!,
  },
  description: DEFAULT_SITE_SETTINGS.seoDescription!,
  alternates: {
    canonical: getCanonicalUrl('/'),
  },
  openGraph: {
    url: getCanonicalUrl('/'),
    title: DEFAULT_SITE_SETTINGS.seoTitle!,
    description: DEFAULT_SITE_SETTINGS.seoDescription!,
  },
}

export default function HomePage() {
  const baseUrl = getBaseUrl()

  // Organization JSON-LD — only confirmed factual fields.
  // sameAs: empty — no social URLs are configured in SiteSettings yet.
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: DEFAULT_SITE_SETTINGS.organizationName,
    url: baseUrl,
    logo: `${baseUrl}/images/bridgeofcompassion-logo.png`,
    email: DEFAULT_SITE_SETTINGS.publicEmail,
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: DEFAULT_SITE_SETTINGS.city,
        addressRegion: DEFAULT_SITE_SETTINGS.province,
        addressCountry: 'CA',
      },
    },
    // sameAs will be populated when social URLs are added to SiteSettings
  }

  return (
    <>
      {/* Organization structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
                   focus:px-4 focus:py-2 focus:bg-brand-sage focus:text-brand-navy focus:rounded-lg
                   focus:font-semibold focus:shadow-lg focus:border focus:border-brand-green"
      >
        Skip to main content
      </a>

      {/* Homepage sections in order */}
      <Hero />
      <WhoWeAre />
      <ImpactStats />
      <ProgramsPreview />
      <WhyBridge />
      <GetInvolved />
      <StoriesPreview />
      <EventsPreview />
      <FinalCTA />
    </>
  )
}
