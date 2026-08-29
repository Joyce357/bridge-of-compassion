// ─── GET /api/admin/volunteers ────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { VolunteerStatus, Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '50')))

    const where: Prisma.VolunteerApplicationWhereInput = {}

    if (statusParam && Object.values(VolunteerStatus).includes(statusParam as VolunteerStatus)) {
      where.status = statusParam as VolunteerStatus
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [applications, total] = await Promise.all([
      prisma.volunteerApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.volunteerApplication.count({ where }),
    ])

    return NextResponse.json({ applications, total, page, limit })
  } catch (err) {
    console.error('[Admin Volunteers API] Error:', err)
    return NextResponse.json({ error: 'Failed to load volunteers.' }, { status: 500 })
  }
}
