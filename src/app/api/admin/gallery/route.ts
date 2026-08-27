// ─── GET /api/admin/gallery ───────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = 30

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.galleryItem.count(),
    ])

    return NextResponse.json({ items, total, page, limit })
  } catch (err) {
    console.error('[Admin Gallery API] Error:', err)
    return NextResponse.json({ error: 'Failed to load gallery.' }, { status: 500 })
  }
}
