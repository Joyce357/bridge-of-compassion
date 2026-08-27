// ─── GET /api/admin/newsletter ────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') as 'ACTIVE' | 'UNSUBSCRIBED') ?? 'ACTIVE'
    const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit  = 50

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where:   { status },
        orderBy: { subscribedAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.newsletterSubscriber.count({ where: { status } }),
    ])

    return NextResponse.json({ subscribers, total, page, limit })
  } catch (err) {
    console.error('[Admin Newsletter API] Error:', err)
    return NextResponse.json({ error: 'Failed to load subscribers.' }, { status: 500 })
  }
}
