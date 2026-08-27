// ─── GET /api/admin/stats ─────────────────────────────────────────────────
// Dashboard statistics. Requires admin session.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const [
      contacts,
      volunteers,
      subscribers,
      events,
      posts,
      gallery,
      donations,
    ] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.volunteerApplication.count(),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count({ where: { published: true } }),
      prisma.newsPost.count({ where: { published: true } }),
      prisma.galleryItem.count({ where: { published: true } }),
      prisma.donation.count(),
    ])

    const newContacts   = await prisma.contactSubmission.count({ where: { status: 'NEW' } })
    const newVolunteers = await prisma.volunteerApplication.count({ where: { status: 'NEW' } })

    return NextResponse.json({
      contacts:   { total: contacts,   new: newContacts },
      volunteers: { total: volunteers, new: newVolunteers },
      subscribers,
      events,
      posts,
      gallery,
      donations,
    })
  } catch (err) {
    console.error('[Admin Stats API] Error:', err)
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 })
  }
}
