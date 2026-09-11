// ─── Public Event Detail Page ─────────────────────────────────────────────

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { getPublishedEventById, getCategoryAccent } from '@/lib/events'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await getPublishedEventById(params.id)
    if (!event) return { title: 'Event Not Found' }
    return {
      title: `${event.title} — Events`,
      description: event.shortDescription || event.description.slice(0, 160),
    }
  } catch {
    return { title: 'Event Not Found' }
  }
}

export default async function EventDetailPage({ params }: Props) {
  let event: Awaited<ReturnType<typeof getPublishedEventById>> = null

  try {
    event = await getPublishedEventById(params.id)
  } catch (err) {
    console.error('[Event Detail] DB query failed:', (err as Error)?.message)
    notFound()
  }

  if (!event) {
    notFound()
  }

  const accent = getCategoryAccent(event.category)
  const { month, day } = formatDateBadge(event.date)

  return (
    <div className="min-h-screen bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200">
      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="bg-brand-cream/60 dark:bg-dark-surface border-b border-border-soft/60 dark:border-dark-border py-3 sm:py-4 transition-colors duration-200">
        <Container>
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary">
            <Link href="/" className="hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/events" className="hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors">
              Events
            </Link>
            <span>/</span>
            <span className="font-semibold text-brand-navy dark:text-dark-text-primary truncate max-w-[200px] sm:max-w-xs">
              {event.title}
            </span>
          </nav>
        </Container>
      </div>

      {/* ── Event Header ─────────────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}
              >
                {event.category || 'Environmental'}
              </span>
              {event.featured && (
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-full">
                  ★ Featured Event
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight mb-4 text-balance">
              {event.title}
            </h1>

            {event.shortDescription && (
              <p className="text-text-secondary dark:text-dark-text-secondary text-base sm:text-lg leading-relaxed font-medium mb-6">
                {event.shortDescription}
              </p>
            )}

            {/* Quick Metadata Box */}
            <div className="grid sm:grid-cols-2 gap-4 p-5 bg-brand-cream/60 dark:bg-dark-card rounded-2xl border border-border-soft dark:border-dark-border mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-brand-navy dark:bg-dark-surface border border-transparent dark:border-dark-border flex flex-col items-center justify-center text-brand-warm-white shrink-0 shadow-xs">
                  <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
                    {month}
                  </span>
                  <span className="text-brand-warm-white text-lg font-black leading-none mt-0.5">
                    {day}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary font-medium">Date & Time</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-dark-text-primary">{formatDateLong(event.date)}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary font-semibold">
                    {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-brand-green/15 dark:bg-brand-cyan/15 text-brand-green dark:text-brand-cyan flex items-center justify-center text-xl shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary font-medium">Location</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-dark-text-primary">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="divider-green mb-8" />
          </div>
        </Container>
      </section>

      {/* ── Featured Image & Content ─────────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {event.featuredImage && (
              <div className="relative aspect-[16/9] w-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-card border border-border-soft dark:border-dark-border bg-brand-cream dark:bg-dark-surface">
                <Image
                  src={event.featuredImage}
                  alt={event.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            )}

            {/* Description Body */}
            <div>
              <h2 className="text-xl font-bold text-brand-navy dark:text-dark-text-primary mb-3">About This Event</h2>
              <div className="prose prose-slate max-w-none text-text-primary dark:text-dark-text-primary text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
                {event.description}
              </div>
            </div>

            {/* Registration CTA card */}
            <div className="p-6 bg-brand-cream/40 dark:bg-dark-card rounded-2xl border border-border-soft dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-brand-navy dark:text-dark-text-primary text-base">Want to attend?</h3>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
                  {event.registrationOpen
                    ? 'RSVP or reach out to participate in this community event.'
                    : 'Registration for this event is currently closed.'}
                </p>
              </div>

              <div>
                {event.registrationLink && event.registrationOpen ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green dark:bg-brand-cyan hover:bg-brand-navy dark:hover:bg-brand-cyan/90 text-white dark:text-brand-navy-dark text-sm font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Register Online ↗
                  </a>
                ) : event.registrationOpen ? (
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-navy dark:bg-brand-cyan hover:bg-brand-green dark:hover:bg-brand-cyan/90 text-white dark:text-brand-navy-dark text-sm font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Inquire About Attendance
                  </Link>
                ) : (
                  <span className="inline-block px-4 py-2 bg-brand-cream dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary text-xs font-bold rounded-xl border border-border-soft dark:border-dark-border">
                    Registration Closed
                  </span>
                )}
              </div>
            </div>

            {/* Next Steps & Back Link */}
            <div className="pt-8 border-t border-border-soft dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-navy dark:text-dark-text-primary hover:text-brand-green dark:hover:text-brand-cyan transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to All Events
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/volunteer"
                  className="px-5 py-2.5 bg-brand-green dark:bg-brand-cyan hover:bg-brand-navy dark:hover:bg-brand-cyan/90 text-white dark:text-brand-navy-dark text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  Volunteer With Us
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-white dark:bg-dark-card hover:bg-brand-cream dark:hover:bg-dark-card-hover text-brand-navy dark:text-dark-text-primary text-xs sm:text-sm font-bold rounded-xl border border-border-soft dark:border-dark-border shadow-xs transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
