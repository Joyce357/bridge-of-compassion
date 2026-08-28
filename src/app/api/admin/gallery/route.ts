// ─── GET & POST /api/admin/gallery ─────────────────────────────────────────
// Admin Gallery API for listing and creating gallery items.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { gallerySchema, formatZodErrors } from '@/lib/validations'
import { getNextDisplayOrder } from '@/lib/gallery'

// ── GET: List gallery items ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '50')))

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.galleryItem.count(),
    ])

    return NextResponse.json({ items, total, page, limit })
  } catch (err) {
    console.error('[Admin Gallery API GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load gallery items.' }, { status: 500 })
  }
}

// ── POST: Create gallery item ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = gallerySchema.safeParse(body)

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
      caption,
      altText,
      imageUrl,
      imagePublicId,
      category,
      featured,
      published,
      displayOrder,
    } = result.data

    const nextOrder = displayOrder > 0 ? displayOrder : await getNextDisplayOrder()

    const item = await prisma.galleryItem.create({
      data: {
        title: title || null,
        caption: caption || null,
        altText: altText || null,
        imageUrl,
        imagePublicId: imagePublicId || null,
        category: category || 'Community',
        featured: featured ?? false,
        displayOrder: nextOrder,
        published: published ?? false,
      },
    })

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (err) {
    console.error('[Admin Gallery API POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create gallery item.' }, { status: 500 })
  }
}
