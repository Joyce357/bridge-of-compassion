'use client'

import Link from 'next/link'
import Container from '@/components/ui/Container'
import { useVolunteerModal } from '@/context/VolunteerModalContext'

const pathways = [
  {
    id: 'volunteer',
    title: 'Volunteer',
    description:
      'Join community cleanups, tree planting days, and youth outdoor learning programmes. Every volunteer makes an impact.',
    iconColor: 'text-brand-green',
    iconBg: 'bg-brand-sage/40',
    borderColor: 'hover:border-brand-green',
    href: '/volunteer',
    cta: 'Become a Volunteer',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'donate',
    title: 'Donate',
    description:
      'Your financial contribution directly funds tree planting, youth workshops, and environmental educational resources.',
    iconColor: 'text-accent-pink',
    iconBg: 'bg-pink-50',
    borderColor: 'hover:border-accent-pink',
    href: '/donate',
    cta: 'Make a Donation',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'partner',
    title: 'Partner With Us',
    description:
      'Schools, community groups, and green organizations can amplify environmental impact by partnering with us.',
    iconColor: 'text-brand-cyan',
    iconBg: 'bg-brand-sky',
    borderColor: 'hover:border-brand-cyan',
    href: '/get-involved#partner',
    cta: 'Explore Partnership',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'support',
    title: 'Spread the Word',
    description:
      'Share our mission, attend workshops, or connect young leaders with environmental initiatives in your community.',
    iconColor: 'text-accent-orange',
    iconBg: 'bg-orange-50',
    borderColor: 'hover:border-accent-orange',
    href: '/get-involved',
    cta: 'Get Involved',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
]

export default function GetInvolved() {
  const { openVolunteerModal } = useVolunteerModal()

  return (
    <section
      className="section-py bg-brand-cream border-y border-border-soft/60 relative overflow-hidden"
      aria-labelledby="get-involved-heading"
    >
      <Container className="relative z-10">

        {/* Section heading */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <span className="eyebrow block mb-2">
            Get Involved
          </span>
          <h2
            id="get-involved-heading"
            className="text-brand-navy text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2.5 text-balance tracking-tight"
          >
            Be Part of the Environmental Movement
          </h2>
          <div className="divider-green mx-auto mb-2.5" />
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            There are many ways to support young people, community sustainability, and the
            natural world. Find the path that fits you.
          </p>
        </div>

        {/* Pathway cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {pathways.map((pathway) => {
            const isVolunteer = pathway.id === 'volunteer'

            return isVolunteer ? (
              <button
                key={pathway.id}
                type="button"
                onClick={openVolunteerModal}
                className={`group flex flex-col text-left p-4.5 sm:p-5.5 rounded-2xl bg-brand-warm-white border border-border-soft
                           hover:border-brand-green/40 hover:shadow-card-hover hover:-translate-y-0.5
                           transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-navy cursor-pointer ${pathway.borderColor}`}
                aria-label={pathway.cta}
              >
                {/* Icon */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${pathway.iconBg} ${pathway.iconColor} flex items-center justify-center mb-3 sm:mb-3.5 group-hover:scale-105 transition-transform duration-200`}>
                  {pathway.icon}
                </div>

                {/* Text */}
                <h3 className="text-base sm:text-lg font-bold text-brand-navy mb-1.5 group-hover:text-brand-green transition-colors">
                  {pathway.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed flex-1">
                  {pathway.description}
                </p>

                {/* CTA arrow */}
                <div className="flex items-center gap-1.5 mt-4 sm:mt-5 text-xs sm:text-sm font-bold text-brand-green group-hover:text-brand-navy transition-colors duration-200">
                  {pathway.cta}
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            ) : (
              <Link
                key={pathway.id}
                href={pathway.href}
                className={`group flex flex-col p-4.5 sm:p-5.5 rounded-2xl bg-brand-warm-white border border-border-soft
                           hover:border-brand-green/40 hover:shadow-card-hover hover:-translate-y-0.5
                           transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-navy ${pathway.borderColor}`}
                aria-label={pathway.cta}
              >
                {/* Icon */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${pathway.iconBg} ${pathway.iconColor} flex items-center justify-center mb-3 sm:mb-3.5 group-hover:scale-105 transition-transform duration-200`}>
                  {pathway.icon}
                </div>

                {/* Text */}
                <h3 className="text-base sm:text-lg font-bold text-brand-navy mb-1.5 group-hover:text-brand-green transition-colors">
                  {pathway.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed flex-1">
                  {pathway.description}
                </p>

                {/* CTA arrow */}
                <div className="flex items-center gap-1.5 mt-4 sm:mt-5 text-xs sm:text-sm font-bold text-brand-green group-hover:text-brand-navy transition-colors duration-200">
                  {pathway.cta}
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

      </Container>
    </section>
  )
}
