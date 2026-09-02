import Link from 'next/link'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { getUpcomingEvents } from '@/lib/events'
import { formatDateShort } from '@/lib/utils'
import type { Event } from '@/types'

export default async function EventsPreview() {
  let upcoming: Event[] = []

  try {
    upcoming = await getUpcomingEvents(3)
  } catch (err) {
    console.error('[EventsPreview] DB query failed:', (err as Error)?.message)
    return null
  }

  return (
    <section className="section-py bg-[#D1DFC4] dark:bg-[#0F2119] border-y border-[#C2D3B2] dark:border-dark-border transition-colors duration-200" aria-labelledby="events-heading">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Join Us in Environmental Action"
            subtitle="Connect with your community and take part in hands-on conservation and workshops."
            id="events-heading"
          />
          <Button href="/events" variant="secondary" size="md" className="shrink-0">
            All Events
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-8 text-center bg-brand-warm-white/70 dark:bg-dark-card rounded-2xl border border-[#C2D3B2]/80 dark:border-dark-border max-w-lg mx-auto">
            <p className="text-brand-navy dark:text-dark-text-primary font-bold text-base mb-1">No Upcoming Events Scheduled</p>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-4">
              Check back soon for upcoming community workshops and environmental initiatives.
            </p>
            <Link
              href="/events"
              className="inline-block text-xs font-bold text-brand-green dark:text-brand-cyan hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors"
            >
              View Events Calendar →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-3.5">
            {upcoming.map((event) => {
              const [month, day] = formatDateShort(event.date).split(' ')
              return (
                <div
                  key={event.id}
                  className="group flex items-start gap-3.5 sm:gap-4.5 p-3.5 sm:p-4.5 card hover:shadow-card-hover
                             focus-visible:ring-2 focus-visible:ring-brand-navy dark:focus-visible:ring-brand-cyan bg-brand-warm-white dark:bg-dark-card border border-[#C2D3B2]/80 dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40"
                >
                  {/* Date stamp */}
                  <div className="shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-brand-navy dark:bg-dark-surface border border-transparent dark:border-dark-border flex flex-col items-center justify-center text-brand-warm-white shadow-xs">
                    <span className="text-brand-cyan text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      {month}
                    </span>
                    <span className="text-brand-warm-white text-lg sm:text-xl font-black leading-none mt-0.5">
                      {day}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                      <h3 className="text-brand-navy dark:text-dark-text-primary font-bold text-sm sm:text-base group-hover:text-brand-green dark:group-hover:text-brand-cyan transition-colors duration-200">
                        <Link href={`/events/${event.id}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </h3>
                      <Badge variant="green">
                        {event.category || 'Environmental'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm mb-1.5">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-brand-green dark:text-brand-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-brand-green dark:text-brand-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </span>
                    </div>

                    <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {event.shortDescription || event.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Container>
    </section>

  )
}
