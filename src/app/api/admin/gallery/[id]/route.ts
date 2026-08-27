// ─── PATCH /api/admin/gallery/[id] ────────────────────────────────────────
// DELETE /api/admin/gallery/[id]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { z } from 'zod'

const updateSchema = z.object({
  published: z.boolean().optional(),
  caption:   z.string().max(300).optional(),
  category:  z.string().max(100).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body   = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data.' }, { status: 422 })
    }

    const item = await prisma.galleryItem.update({
      where: { id: params.id },
      data:  result.data,
    })

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[Admin Gallery/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update gallery item.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    await prisma.galleryItem.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Gallery/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete gallery item.' }, { status: 500 })
  }
}
