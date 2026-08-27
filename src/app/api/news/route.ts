// ─── GET /api/news ───────────────────────────────────────────────────────
// Returns published news posts, ordered by publishedAt descending.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id:           true,
        title:        true,
        slug:         true,
        excerpt:      true,
        featuredImage: true,
        author:       true,
        publishedAt:  true,
      },
    })
    return NextResponse.json({ posts }, { status: 200 })
  } catch (err) {
    console.error('[News API] Error:', err)
    return NextResponse.json({ error: 'Failed to load news.' }, { status: 500 })
  }
}
