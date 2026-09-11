// ─── Public Programs Page ───────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import { getPublishedPrograms, getCategoryAccent } from '@/lib/programs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programs & Environmental Initiatives',
  description:
    'Explore hands-on environmental education, youth leadership, and community sustainability initiatives at Bridge of Compassion.',
}

export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  let programs: Awaited<ReturnType<typeof getPublishedPrograms>> = []
  let dbError = false

  try {
    programs = await getPublishedPrograms()
  } catch (err) {
    console.error('[Public Programs Page] DB query failed:', (err as Error)?.message)
    dbError = true
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-brand-warm-white dark:bg-dark-bg flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md px-6 py-12">
          <p className="text-lg font-bold text-brand-navy dark:text-dark-text-primary mb-2">Programs temporarily unavailable</p>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            We&apos;re having trouble loading our programs right now. Please try again shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200">
      {/* ── Page Header / Hero ────────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-brand-cream/70 via-brand-cream to-brand-warm-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg border-b border-border-soft/60 dark:border-dark-border transition-colors duration-200">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <span className="eyebrow block mb-2.5">What We Do</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight text-balance mb-4">
              Programs &amp; Environmental Initiatives
            </h1>
            <div className="divider-green mx-auto mb-4" />
            <p className="text-text-secondary dark:text-dark-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Empowering children, youth, and families through practical environmental
              education, hands-on conservation, and sustainable community action.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Main Programs Grid ────────────────────────────────────────────── */}
      <section className="section-py" aria-labelledby="all-programs-heading">
        <Container>
          {programs.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-brand-cream/50 dark:bg-dark-card border border-border-soft dark:border-dark-border">
              <div className="w-12 h-12 rounded-full bg-brand-sage/40 dark:bg-dark-surface text-brand-green dark:text-brand-cyan flex items-center justify-center mx-auto mb-4 text-xl">
                🌿
              </div>
              <h2 id="all-programs-heading" className="text-lg font-bold text-brand-navy dark:text-dark-text-primary mb-2">
                No Programs Listed Yet
              </h2>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Programs and initiatives will be added here as they become available.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <SectionHeading
                  eyebrow="Active Areas"
                  title="Explore Our Focus Areas"
                  subtitle="Discover our core educational themes and community projects."
                  id="all-programs-heading"
                />
                <div className="hidden sm:block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
                  Showing {programs.length} initiatives
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {programs.map((program) => {
                  const accent = getCategoryAccent(program.category)
                  return (
                    <article
                      key={program.id}
                      className="group flex flex-col rounded-2xl bg-white dark:bg-dark-card border border-border-soft dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40 hover:shadow-card-hover transition-all duration-200 overflow-hidden"
                    >
                      {/* Image Preview (if present) */}
                      {program.imageUrl && (
                        <div className="relative aspect-[16/9] w-full bg-brand-cream dark:bg-dark-surface overflow-hidden">
                          <Image
                            src={program.imageUrl}
                            alt={program.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder} shadow-xs backdrop-blur-xs`}
                            >
                              {program.category}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {!program.imageUrl && (
                            <div className="mb-3">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}
                              >
                                {program.category}
                              </span>
                            </div>
                          )}

                          <h2 className="text-lg sm:text-xl font-bold text-brand-navy dark:text-dark-text-primary group-hover:text-brand-green dark:group-hover:text-brand-cyan transition-colors mb-2">
                            <Link href={`/programs/${program.slug}`} className="focus-visible:outline-none focus-visible:underline">
                              {program.title}
                            </Link>
                          </h2>

                          <p className="text-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed line-clamp-3 mb-4">
                            {program.shortDescription}
                          </p>
                        </div>

                        {/* Read More Link */}
                        <div className="pt-3 border-t border-border-soft/60 dark:border-dark-border flex items-center justify-between">
                          <Link
                            href={`/programs/${program.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-green dark:text-brand-cyan group-hover:text-brand-navy dark:group-hover:text-dark-text-primary transition-colors"
                          >
                            <span>Learn more</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </Link>

                          {program.featured && (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-brand-sky/40 dark:bg-dark-surface border-t border-brand-sky/70 dark:border-dark-border transition-colors duration-200">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-dark-text-primary mb-3">
              Want to get involved in our programs?
            </h2>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed mb-6">
              Join our community volunteer days or partner with us to bring environmental workshops to your school or neighborhood.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/volunteer"
                className="px-6 py-3 bg-brand-green dark:bg-brand-cyan hover:bg-brand-navy dark:hover:bg-brand-cyan/90 text-white dark:text-brand-navy-dark text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                Volunteer With Us
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white dark:bg-dark-card hover:bg-brand-cream dark:hover:bg-dark-card-hover text-brand-navy dark:text-dark-text-primary text-sm font-bold rounded-xl border border-border-soft dark:border-dark-border shadow-xs transition-colors"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
