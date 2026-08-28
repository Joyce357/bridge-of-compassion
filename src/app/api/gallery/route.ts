// ─── GET /api/gallery ────────────────────────────────────────────────────
// Public API for fetching published gallery items.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const where: { published: boolean; category?: string } = { published: true }
    if (category && category !== 'ALL') {
      where.category = category
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ items }, { status: 200 })
  } catch (err) {
    console.error('[Gallery API] Error:', err)
    return NextResponse.json({ error: 'Failed to load gallery.' }, { status: 500 })
  }
}
