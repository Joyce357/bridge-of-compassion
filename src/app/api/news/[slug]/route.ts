// ─── GET /api/news/[slug] ────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const post = await prisma.newsPost.findFirst({
      where: { slug: params.slug, published: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    }

    return NextResponse.json({ post }, { status: 200 })
  } catch (err) {
    console.error('[News/Slug API] Error:', err)
    return NextResponse.json({ error: 'Failed to load post.' }, { status: 500 })
  }
}
