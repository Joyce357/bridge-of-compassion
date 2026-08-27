// ─── GET /api/admin/news ──────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = 20

    const [posts, total] = await Promise.all([
      prisma.newsPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
        select: {
          id:          true,
          title:       true,
          slug:        true,
          excerpt:     true,
          author:      true,
          published:   true,
          publishedAt: true,
          createdAt:   true,
        },
      }),
      prisma.newsPost.count(),
    ])

    return NextResponse.json({ posts, total, page, limit })
  } catch (err) {
    console.error('[Admin News API] Error:', err)
    return NextResponse.json({ error: 'Failed to load news posts.' }, { status: 500 })
  }
}
