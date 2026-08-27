// ─── GET /api/admin/contacts ──────────────────────────────────────────────
// PATCH /api/admin/contacts — bulk status update

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { ContactStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ContactStatus | null
    const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit  = 20

    const where = status ? { status } : {}

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.contactSubmission.count({ where }),
    ])

    return NextResponse.json({ submissions, total, page, limit })
  } catch (err) {
    console.error('[Admin Contacts API] Error:', err)
    return NextResponse.json({ error: 'Failed to load contacts.' }, { status: 500 })
  }
}
