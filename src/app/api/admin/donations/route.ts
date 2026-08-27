// ─── GET /api/admin/donations ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { DonationStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as DonationStatus | null
    const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit  = 20

    const where = status ? { status } : {}

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.donation.count({ where }),
    ])

    return NextResponse.json({ donations, total, page, limit })
  } catch (err) {
    console.error('[Admin Donations API] Error:', err)
    return NextResponse.json({ error: 'Failed to load donations.' }, { status: 500 })
  }
}
