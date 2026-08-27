// ─── PATCH & DELETE /api/admin/events/[id] ────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { eventSchema, formatZodErrors } from '@/lib/validations'

const updateEventSchema = eventSchema.partial()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = updateEventSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data.', errors: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const updateData: Record<string, unknown> = { ...result.data }
    if (result.data.date) {
      updateData.date = new Date(result.data.date)
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ event })
  } catch (err) {
    console.error('[Admin Events/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    await prisma.event.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Events/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete event.' }, { status: 500 })
  }
}
