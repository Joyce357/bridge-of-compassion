// ─── Admin: Events ────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventsManager from '@/components/admin/EventsManager'
import type { Metadata } from 'next'
import type { Event } from '@/types'

export const metadata: Metadata = { title: 'Events' }
export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let events: Event[] = []
  let total = 0
  let dbError = false

  try {
    const [dbEvents, count] = await Promise.all([
      prisma.event.findMany({
        orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      }),
      prisma.event.count(),
    ])
    events = dbEvents as unknown as Event[]
    total = count
  } catch (err) {
    console.error('[Admin Events Page] DB query failed:', (err as Error)?.message)
    dbError = true
  }

  if (dbError) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-xs">
        <p className="text-red-600 font-bold mb-2">Database temporarily unavailable</p>
        <p className="text-sm text-text-secondary">
          Could not connect to the database. Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <EventsManager
      initialEvents={events}
      totalCount={total}
    />
  )
}
