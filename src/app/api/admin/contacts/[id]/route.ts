// ─── /api/admin/contacts/[id] ─────────────────────────────────────────────
// GET    — fetch single submission with communication history
// PATCH  — update status and/or adminNotes
// DELETE — permanently remove submission + cascade-delete communications

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { adminContactUpdateSchema } from '@/lib/validations'

interface RouteContext {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveParams(context: RouteContext): Promise<{ id: string }> {
  if ('then' in context.params) {
    return await context.params
  }
  return context.params
}

export async function GET(
  _req: NextRequest,
  context: RouteContext,
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await resolveParams(context)

    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        communications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Contact submission not found.' }, { status: 404 })
    }

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[Admin Contacts/ID GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load contact submission.' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext,
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await resolveParams(context)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = adminContactUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: result.error.flatten() },
        { status: 422 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.status !== undefined) {
      updateData.status = result.data.status
    }
    if (result.data.adminNotes !== undefined) {
      updateData.adminNotes = result.data.adminNotes || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update fields provided.' }, { status: 400 })
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data:  updateData,
    })

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[Admin Contacts/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update contact submission.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext,
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await resolveParams(context)
    await prisma.contactSubmission.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Contacts/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete contact submission.' }, { status: 500 })
  }
}
