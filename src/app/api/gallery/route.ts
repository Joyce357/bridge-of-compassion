// ─── GET /api/gallery ────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where:   { published: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ items }, { status: 200 })
  } catch (err) {
    console.error('[Gallery API] Error:', err)
    return NextResponse.json({ error: 'Failed to load gallery.' }, { status: 500 })
  }
}
