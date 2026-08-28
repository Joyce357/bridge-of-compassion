// ─── GET, PATCH & DELETE /api/admin/gallery/[id] ───────────────────────────
// Admin endpoint for managing individual gallery items by ID.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { gallerySchema, formatZodErrors } from '@/lib/validations'
import { deleteGalleryImage } from '@/lib/cloudinary'

// ── GET: Get gallery item by ID ───────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[Admin Gallery [id] GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch gallery item.' }, { status: 500 })
  }
}

// ── PATCH: Update gallery item ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = gallerySchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed.',
          fields: formatZodErrors(result.error),
        },
        { status: 422 },
      )
    }

    // Find existing item
    const existing = await prisma.galleryItem.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 })
    }

    // Clean up old Cloudinary image if replaced
    if (
      result.data.imagePublicId &&
      existing.imagePublicId &&
      result.data.imagePublicId !== existing.imagePublicId
    ) {
      await deleteGalleryImage(existing.imagePublicId)
    }

    const updated = await prisma.galleryItem.update({
      where: { id: existing.id },
      data: {
        ...(result.data.title !== undefined && { title: result.data.title || null }),
        ...(result.data.caption !== undefined && { caption: result.data.caption || null }),
        ...(result.data.altText !== undefined && { altText: result.data.altText || null }),
        ...(result.data.imageUrl !== undefined && { imageUrl: result.data.imageUrl }),
        ...(result.data.imagePublicId !== undefined && { imagePublicId: result.data.imagePublicId || null }),
        ...(result.data.category !== undefined && { category: result.data.category || null }),
        ...(result.data.featured !== undefined && { featured: result.data.featured }),
        ...(result.data.displayOrder !== undefined && { displayOrder: result.data.displayOrder }),
        ...(result.data.published !== undefined && { published: result.data.published }),
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (err) {
    console.error('[Admin Gallery [id] PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update gallery item.' }, { status: 500 })
  }
}

// ── DELETE: Delete gallery item ────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const existing = await prisma.galleryItem.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 })
    }

    // Clean up Cloudinary asset if present
    if (existing.imagePublicId) {
      await deleteGalleryImage(existing.imagePublicId)
    }

    await prisma.galleryItem.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ success: true, message: 'Gallery item deleted successfully.' })
  } catch (err) {
    console.error('[Admin Gallery [id] DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete gallery item.' }, { status: 500 })
  }
}
