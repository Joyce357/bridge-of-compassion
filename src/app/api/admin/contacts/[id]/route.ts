// ─── PATCH /api/admin/contacts/[id] ──────────────────────────────────────
// DELETE /api/admin/contacts/[id]

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 422 })
    }

    const submission = await prisma.contactSubmission.update({
      where: { id: params.id },
      data:  { status: result.data.status },
    })

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[Admin Contacts/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    await prisma.contactSubmission.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Contacts/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete submission.' }, { status: 500 })
  }
}
