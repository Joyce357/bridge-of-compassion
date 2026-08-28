// ─── GET & POST /api/admin/news ─────────────────────────────────────────────
// Admin News API for listing and creating news posts.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { newsSchema, formatZodErrors } from '@/lib/validations'

// ── GET: List news posts ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '50')))

    const [posts, total] = await Promise.all([
      prisma.newsPost.findMany({
        orderBy: [{ createdAt: 'desc' }],
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.newsPost.count(),
    ])

    return NextResponse.json({ posts, total, page, limit })
  } catch (err) {
    console.error('[Admin News API GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load news posts.' }, { status: 500 })
  }
}

// ── POST: Create news post ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = newsSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed.',
          fields: formatZodErrors(result.error),
        },
        { status: 422 },
      )
    }

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      imagePublicId,
      author,
      featured,
      published,
      publishedAt,
    } = result.data

    // Check slug uniqueness
    const existing = await prisma.newsPost.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: 'A story with this URL slug already exists. Please choose a unique slug.',
          fields: { slug: 'Slug is already taken.' },
        },
        { status: 409 },
      )
    }

    const post = await prisma.newsPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category: category || null,
        featuredImage: featuredImage || null,
        imagePublicId: imagePublicId || null,
        author: author || null,
        featured: featured ?? false,
        published: published ?? false,
        publishedAt: published
          ? (publishedAt ? new Date(publishedAt) : new Date())
          : (publishedAt ? new Date(publishedAt) : null),
      },
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (err) {
    console.error('[Admin News API POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create news post.' }, { status: 500 })
  }
}
