// ─── Public Events Page ───────────────────────────────────────────────────
// Reads real published events directly from Neon PostgreSQL.
// Zero records displays a polished empty state — static fallback data is never displayed.

import type { Metadata } from 'next'
import { getPublishedEvents, getCategoryAccent } from '@/lib/events'
import Container from '@/components/ui/Container'
import Link from 'next/link'
import type { Event } from '@/types'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Upcoming events from Bridge of Compassion. Join us for community cleanups, workshops, fundraisers, and environmental stewardship.',
  alternates: { canonical: 'https://bridgeofcompassion.org/events' },
}

export const dynamic = 'force-dynamic'

function formatDateLong(dateVal: Date | string) {
  return new Date(dateVal).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateBadge(dateVal: Date | string) {
  const parts = new Date(dateVal)
    .toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    .split(' ')
  return { month: parts[0] || '', day: parts[1] || '' }
}

export default async function EventsPage() {
  let events: Event[] = []
  let dbError = false

  try {
    events = await getPublishedEvents()
  } catch (err) {
    console.error('[Public Events Page] DB query failed:', (err as Error)?.message)
    dbError = true
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-brand-warm-white flex items-center justify-center">
        <div className="text-center max-w-md px-6 py-12">
          <p className="text-lg font-bold text-brand-navy mb-2">Events temporarily unavailable</p>
          <p className="text-sm text-text-secondary">
            We&apos;re having trouble loading upcoming events right now. Please check back shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-warm-white">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <Container className="text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">What&apos;s On</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">
            Upcoming Events
          </h1>
          <p className="text-brand-warm-white/80 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Connect with your community and take part in hands-on environmental stewardship, workshops, and gatherings.
          </p>
        </Container>
      </section>

      {/* ── Events Grid / Empty State ───────────────────────────────────── */}
      <section className="section-py">
        <Container>
          {events.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-brand-cream/50 rounded-3xl border border-border-soft">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center text-3xl">
                📅
              </div>
              <h2 className="text-xl font-extrabold text-brand-navy mb-2">No Upcoming Events</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                No upcoming events are currently scheduled. Please check back soon for future opportunities to get involved.
              </p>
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-brand-navy text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                Get Involved as a Volunteer
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((evt) => {
                const { month, day } = formatDateBadge(evt.date)
                const accent = getCategoryAccent(evt.category)
                return (
                  <article
                    key={evt.id}
                    className="card p-6 bg-brand-warm-white border border-border-soft hover:border-brand-green/40 hover:shadow-card-hover flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-navy flex flex-col items-center justify-center text-brand-warm-white shrink-0 shadow-xs">
                            <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
                              {month}
                            </span>
                            <span className="text-brand-warm-white text-lg font-black leading-none mt-0.5">
                              {day}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}
                            >
                              {evt.category || 'Environmental'}
                            </span>
                            <p className="text-xs text-text-secondary mt-1 font-semibold">
                              {formatDateLong(evt.date)}
                            </p>
                          </div>
                        </div>

                        {evt.featured && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-xl font-extrabold text-brand-navy mb-2 tracking-tight">
                        <Link
                          href={`/events/${evt.id}`}
                          className="hover:text-brand-green transition-colors"
                        >
                          {evt.title}
                        </Link>
                      </h2>

                      <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-3">
                        {evt.shortDescription || evt.description}
                      </p>

                      {/* Info details */}
                      <div className="space-y-1.5 text-xs text-text-secondary bg-brand-cream/40 p-3 rounded-xl border border-border-soft/60 mb-5">
                        <p className="flex items-center gap-2">
                          <span>🕐</span>
                          <span className="font-semibold text-brand-navy">
                            {evt.startTime}
                            {evt.endTime ? ` – ${evt.endTime}` : ''}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="truncate">{evt.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border-soft/60">
                      <Link
                        href={`/events/${evt.id}`}
                        className="flex-1 justify-center px-3.5 py-2.5 bg-brand-cream hover:bg-brand-sage/40 text-brand-navy text-xs font-bold rounded-xl border border-border-soft transition-colors inline-flex items-center gap-1"
                      >
                        Details →
                      </Link>

                      {evt.registrationLink && evt.registrationOpen ? (
                        <a
                          href={evt.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 justify-center px-3.5 py-2.5 bg-brand-green hover:bg-brand-navy text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
                        >
                          Register ↗
                        </a>
                      ) : evt.registrationOpen ? (
                        <Link
                          href="/contact"
                          className="flex-1 justify-center px-3.5 py-2.5 bg-brand-navy hover:bg-brand-green text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
                        >
                          Inquire
                        </Link>
                      ) : (
                        <span className="flex-1 text-center py-2 text-xs text-text-secondary/70 italic bg-brand-cream/30 rounded-xl">
                          Closed
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}
