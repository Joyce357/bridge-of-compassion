import { prisma } from '@/lib/prisma'
import type { Event } from '@/types'

// ─── Event Query Layer (Neon PostgreSQL is Authoritative) ───────────────────
// All event functions query the database directly.
// No fallback static data is returned if the database returns 0 records.

export interface CategoryAccent {
  badgeBg: string
  badgeText: string
  badgeBorder: string
}

export function getCategoryAccent(category?: string | null): CategoryAccent {
  const cat = (category || '').toLowerCase()
  if (cat.includes('environment') || cat.includes('clean') || cat.includes('steward')) {
    return {
      badgeBg: 'bg-brand-sage/40',
      badgeText: 'text-brand-green',
      badgeBorder: 'border-brand-green/20',
    }
  }
  if (cat.includes('volunteer')) {
    return {
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
    }
  }
  if (cat.includes('fundrais') || cat.includes('gala')) {
    return {
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      badgeBorder: 'border-purple-200',
    }
  }
  if (cat.includes('youth') || cat.includes('leader')) {
    return {
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-200',
    }
  }
  return {
    badgeBg: 'bg-brand-cream',
    badgeText: 'text-brand-navy',
    badgeBorder: 'border-border-soft',
  }
}

/**
 * Returns all published events ordered by date ascending (nearest upcoming first).
 * Returns an empty array if no events are published.
 * Throws if database is unavailable.
 */
export async function getPublishedEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  })
  return events as unknown as Event[]
}

/**
 * Returns upcoming published events for homepage preview.
 * Prioritizes featured events, ordered by date ascending.
 * Throws if database is unavailable.
 */
export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const events = await prisma.event.findMany({
    where: {
      published: true,
      date: { gte: startOfToday },
    },
    orderBy: [{ featured: 'desc' }, { date: 'asc' }],
    take: limit,
  })
  return events as unknown as Event[]
}

/**
 * Returns a single published event by ID.
 * Returns null if not found or not published.
 * Throws if database is unavailable.
 */
export async function getPublishedEventById(id: string): Promise<Event | null> {
  const event = await prisma.event.findUnique({
    where: { id },
  })

  if (!event || !event.published) {
    return null
  }

  return event as unknown as Event
}
