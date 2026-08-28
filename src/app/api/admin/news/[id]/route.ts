// ─── GET, PATCH & DELETE /api/admin/news/[id] ──────────────────────────────
// Admin endpoint for managing individual news posts by ID or slug.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { newsSchema, formatZodErrors } from '@/lib/validations'
import { deleteNewsImage } from '@/lib/cloudinary'

// ── GET: Get news post by ID or slug ───────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const post = await prisma.newsPost.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'News post not found.' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (err) {
    console.error('[Admin News [id] GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch news post.' }, { status: 500 })
  }
}

// ── PATCH: Update news post ────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = newsSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed.',
          fields: formatZodErrors(result.error),
        },
        { status: 422 },
      )
    }

    // Find existing post
    const existing = await prisma.newsPost.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'News post not found.' }, { status: 404 })
    }

    // If slug changed, verify uniqueness
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugConflict = await prisma.newsPost.findUnique({
        where: { slug: result.data.slug },
      })
      if (slugConflict && slugConflict.id !== existing.id) {
        return NextResponse.json(
          {
            error: 'A story with this URL slug already exists. Please choose a unique slug.',
            fields: { slug: 'Slug is already taken.' },
          },
          { status: 409 },
        )
      }
    }

    // Handle published date logic
    let publishedAt = existing.publishedAt
    if (result.data.published === true && !existing.published && !result.data.publishedAt) {
      publishedAt = new Date()
    } else if (result.data.publishedAt !== undefined) {
      publishedAt = result.data.publishedAt ? new Date(result.data.publishedAt) : null
    }

    // Clean up old Cloudinary image if replaced
    if (
      result.data.imagePublicId &&
      existing.imagePublicId &&
      result.data.imagePublicId !== existing.imagePublicId
    ) {
      await deleteNewsImage(existing.imagePublicId)
    }

    const updated = await prisma.newsPost.update({
      where: { id: existing.id },
      data: {
        ...(result.data.title !== undefined && { title: result.data.title }),
        ...(result.data.slug !== undefined && { slug: result.data.slug }),
        ...(result.data.excerpt !== undefined && { excerpt: result.data.excerpt || null }),
        ...(result.data.content !== undefined && { content: result.data.content }),
        ...(result.data.category !== undefined && { category: result.data.category || null }),
        ...(result.data.featuredImage !== undefined && { featuredImage: result.data.featuredImage || null }),
        ...(result.data.imagePublicId !== undefined && { imagePublicId: result.data.imagePublicId || null }),
        ...(result.data.author !== undefined && { author: result.data.author || null }),
        ...(result.data.featured !== undefined && { featured: result.data.featured }),
        ...(result.data.published !== undefined && { published: result.data.published }),
        publishedAt,
      },
    })

    return NextResponse.json({ success: true, post: updated })
  } catch (err) {
    console.error('[Admin News [id] PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update news post.' }, { status: 500 })
  }
}

// ── DELETE: Delete news post ───────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const existing = await prisma.newsPost.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'News post not found.' }, { status: 404 })
    }

    // Clean up Cloudinary asset if present
    if (existing.imagePublicId) {
      await deleteNewsImage(existing.imagePublicId)
    }

    await prisma.newsPost.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ success: true, message: 'Story deleted successfully.' })
  } catch (err) {
    console.error('[Admin News [id] DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete news post.' }, { status: 500 })
  }
}
