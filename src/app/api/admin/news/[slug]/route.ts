// ─── PATCH /api/admin/news/[slug] ─────────────────────────────────────────
// DELETE /api/admin/news/[slug]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { z } from 'zod'

const updateSchema = z.object({
  published: z.boolean().optional(),
}).passthrough()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body   = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data.' }, { status: 422 })
    }

    const data: Record<string, unknown> = { ...result.data }
    if (result.data.published === true) {
      data.publishedAt = new Date()
    }

    const post = await prisma.newsPost.update({
      where: { slug: params.slug },
      data,
    })

    return NextResponse.json({ post })
  } catch (err) {
    console.error('[Admin News/Slug PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    await prisma.newsPost.delete({ where: { slug: params.slug } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin News/Slug DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 })
  }
}
