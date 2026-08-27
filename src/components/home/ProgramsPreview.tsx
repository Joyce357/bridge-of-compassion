import Link from 'next/link'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { getFeaturedPrograms, getCategoryAccent } from '@/lib/programs'

function getProgramIcon(category: string, title: string) {
  const text = `${category} ${title}`.toLowerCase()
  if (text.includes('environmental') || text.includes('education')) {
    return (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17.5 9.5 13 17 11V8m0-6C9.5 2 4 7.5 4 15c0 .35.03.69.07 1.03C5.9 11.83 9.5 8 17 6V2z" />
      </svg>
    )
  }
  if (text.includes('outdoor') || text.includes('nature') || text.includes('leaf')) {
    return (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L6.5 11h3.5v7h4v-7h3.5L12 2zM4 19h16v2H4v-2z" />
      </svg>
    )
  }
  if (text.includes('youth') || text.includes('leadership')) {
    return (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    )
  }
  if (text.includes('community') || text.includes('action') || text.includes('clean') || text.includes('tree')) {
    return (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    )
  }
  if (text.includes('water') || text.includes('climate')) {
    return (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  )
}

export default async function ProgramsPreview() {
  let programs: Awaited<ReturnType<typeof getFeaturedPrograms>> = []

  try {
    programs = await getFeaturedPrograms(6)
  } catch (err) {
    console.error('[ProgramsPreview] Database query failed:', (err as Error)?.message)
    // Return null — do not display static fallback data as if it were database content.
    return null
  }

  // If database has no published programs yet, hide the section rather than showing fake content.
  if (programs.length === 0) return null

  return (
    <section className="section-py bg-[#D1DFC4] border-y border-[#C2D3B2] relative overflow-hidden" aria-labelledby="programs-heading">
      <Container>

        {/* Header with decorative branches matching mockup */}
        <div className="relative flex items-center justify-between mb-6 sm:mb-8">
          {/* Left decorative branch */}
          <div className="hidden md:block w-14 h-10 text-brand-green shrink-0 pointer-events-none opacity-75" aria-hidden="true">
            <svg viewBox="0 0 64 48" fill="currentColor" className="w-full h-full">
              <path d="M12 36C22 34 32 24 40 12M24 30C28 20 34 16 42 16M14 36C18 30 22 28 26 26" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <ellipse cx="44" cy="11" rx="6" ry="3.5" transform="rotate(-30 44 11)" />
              <ellipse cx="32" cy="18" rx="5" ry="3" transform="rotate(-40 32 18)" />
              <ellipse cx="22" cy="28" rx="5" ry="3" transform="rotate(-20 22 28)" />
            </svg>
          </div>

          {/* Centered Heading */}
          <div className="text-center mx-auto max-w-xl">
            <span className="eyebrow block mb-1.5 text-brand-green font-extrabold">
              WHAT WE DO
            </span>
            <h2
              id="programs-heading"
              className="text-brand-navy text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            >
              From Learning to Action
            </h2>
          </div>

          {/* Right decorative branch */}
          <div className="hidden md:block w-14 h-10 text-brand-green shrink-0 pointer-events-none transform -scale-x-100 opacity-75" aria-hidden="true">
            <svg viewBox="0 0 64 48" fill="currentColor" className="w-full h-full">
              <path d="M12 36C22 34 32 24 40 12M24 30C28 20 34 16 42 16M14 36C18 30 22 28 26 26" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <ellipse cx="44" cy="11" rx="6" ry="3.5" transform="rotate(-30 44 11)" />
              <ellipse cx="32" cy="18" rx="5" ry="3" transform="rotate(-40 32 18)" />
              <ellipse cx="22" cy="28" rx="5" ry="3" transform="rotate(-20 22 28)" />
            </svg>
          </div>
        </div>

        {/* 6 Category / Program cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-4">
          {programs.map((prog) => {
            const accent = getCategoryAccent(prog.category)
            const icon = getProgramIcon(prog.category, prog.title)

            return (
              <Link
                key={prog.id}
                href={`/programs/${prog.slug}`}
                className="group flex flex-col items-center text-center p-4 sm:p-4.5 rounded-2xl bg-brand-warm-white border border-[#C2D3B2]/80
                           shadow-xs hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green"
                aria-label={`Learn more about ${prog.title}`}
              >
                {/* Icon Container */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${accent.iconBg} ${accent.iconColor} mb-2.5 sm:mb-3 transition-transform duration-200 group-hover:scale-105`}
                >
                  {icon}
                </div>

                {/* Title */}
                <h3 className="text-brand-navy text-xs sm:text-sm font-bold leading-snug mb-1 group-hover:text-brand-green transition-colors min-h-[2.5rem] flex items-center">
                  {prog.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-[11.5px] sm:text-xs leading-relaxed flex-1 line-clamp-3">
                  {prog.shortDescription}
                </p>
              </Link>
            )
          })}
        </div>

        {/* View all programs link */}
        <div className="text-center mt-6 sm:mt-8">
          <Button href="/programs" variant="secondary" size="md">
            Explore All Programs &amp; Initiatives
          </Button>
        </div>

      </Container>
    </section>
  )
}

