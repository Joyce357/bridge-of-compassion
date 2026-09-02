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

export const metadata: Metadata = {
  title: 'Bridge of Compassion — Environmental Education & Youth Action',
  description:
    'Bridge of Compassion supports young people through practical environmental education, sustainability programmes, and community action. Get involved today.',
  alternates: {
    canonical: 'https://bridgeofcompassion.org',
  },
}

export default function HomePage() {
  return (
    <>
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
