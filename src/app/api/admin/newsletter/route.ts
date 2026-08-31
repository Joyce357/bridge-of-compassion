// ─── GET /api/admin/newsletter ────────────────────────────────────────────
// Protected admin endpoint to fetch newsletter subscribers with filtering & search.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { Prisma, SubscriberStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const search = searchParams.get('search')
    const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit  = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? '50')))

    const where: Prisma.NewsletterSubscriberWhereInput = {}

    if (statusParam && (statusParam === 'ACTIVE' || statusParam === 'UNSUBSCRIBED')) {
      where.status = statusParam as SubscriberStatus
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [subscribers, total, totalActive, totalUnsubscribed] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    ])

    return NextResponse.json({
      subscribers,
      total,
      totalActive,
      totalUnsubscribed,
      page,
      limit,
    })
  } catch (err) {
    console.error('[Admin Newsletter API] Error:', err)
    return NextResponse.json({ error: 'Failed to load subscribers.' }, { status: 500 })
  }
}
