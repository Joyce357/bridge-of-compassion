// ─── PATCH /api/admin/volunteers/[id] ────────────────────────────────────
// DELETE /api/admin/volunteers/[id]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'CONTACTED', 'ACTIVE', 'INACTIVE']),
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
      return NextResponse.json({ error: 'Invalid status.' }, { status: 422 })
    }

    const application = await prisma.volunteerApplication.update({
      where: { id: params.id },
      data:  { status: result.data.status },
    })

    return NextResponse.json({ application })
  } catch (err) {
    console.error('[Admin Volunteers/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    await prisma.volunteerApplication.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Volunteers/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete application.' }, { status: 500 })
  }
}
