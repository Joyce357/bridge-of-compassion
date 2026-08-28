// ─── POST & DELETE /api/admin/gallery/image ────────────────────────────────
// Dedicated image upload & deletion endpoint for Gallery media.

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminAuth'
import { uploadGalleryImage, deleteGalleryImage } from '@/lib/cloudinary'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB

// ── POST: Upload Gallery Image ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 415 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image file size exceeds the 8 MB limit.' },
        { status: 413 },
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { secure_url, public_id } = await uploadGalleryImage(buffer)

    return NextResponse.json({
      success: true,
      imageUrl: secure_url,
      imagePublicId: public_id,
    })
  } catch (err) {
    console.error('[Admin Gallery Image POST] Error:', err)
    return NextResponse.json({ error: 'Failed to upload gallery image.' }, { status: 500 })
  }
}

// ── DELETE: Delete Gallery Image ───────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const { publicId } = body

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'Public ID is required.' }, { status: 400 })
    }

    // Only allow deletion of gallery folder assets
    if (!publicId.startsWith('bridge-of-compassion/gallery')) {
      return NextResponse.json({ error: 'Invalid gallery asset ID.' }, { status: 403 })
    }

    const success = await deleteGalleryImage(publicId)
    return NextResponse.json({ success })
  } catch (err) {
    console.error('[Admin Gallery Image DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete gallery image.' }, { status: 500 })
  }
}
