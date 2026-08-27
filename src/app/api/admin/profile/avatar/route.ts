// ─── POST & DELETE /api/admin/profile/avatar ────────────────────────────────
// Manages admin avatar uploads to Cloudinary and persists URLs in Neon.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { uploadAdminAvatar, deleteAdminAvatar } from '@/lib/cloudinary'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB

// ── POST: Upload / Replace Avatar ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400 },
      )
    }

    // Server-side type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are accepted.' },
        { status: 415 },
      )
    }

    // Server-side size validation (max 3 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 3 MB limit.' },
        { status: 413 },
      )
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary with deterministic user ID
    const { secure_url } = await uploadAdminAvatar(buffer, session.user.id)

    // Update Neon User.avatarUrl
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data:  { avatarUrl: secure_url },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    })

    return NextResponse.json({
      success: true,
      avatarUrl: updatedUser.avatarUrl,
      user: updatedUser,
    })
  } catch (err) {
    console.error('[Admin Avatar POST] Upload failed:', err)
    return NextResponse.json(
      { error: 'Failed to upload profile picture. Please try again.' },
      { status: 500 },
    )
  }
}

// ── DELETE: Remove Avatar ──────────────────────────────────────────────────

export async function DELETE() {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    // Delete from Cloudinary
    await deleteAdminAvatar(session.user.id)

    // Clear in Neon database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data:  { avatarUrl: null },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    })

    return NextResponse.json({
      success: true,
      avatarUrl: null,
      user: updatedUser,
    })
  } catch (err) {
    console.error('[Admin Avatar DELETE] Deletion failed:', err)
    return NextResponse.json(
      { error: 'Failed to remove profile picture.' },
      { status: 500 },
    )
  }
}
