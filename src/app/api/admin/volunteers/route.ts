// ─── GET /api/admin/volunteers ────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { VolunteerStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as VolunteerStatus | null
    const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit  = 20

    const where = status ? { status } : {}

    const [applications, total] = await Promise.all([
      prisma.volunteerApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.volunteerApplication.count({ where }),
    ])

    return NextResponse.json({ applications, total, page, limit })
  } catch (err) {
    console.error('[Admin Volunteers API] Error:', err)
    return NextResponse.json({ error: 'Failed to load volunteers.' }, { status: 500 })
  }
}
