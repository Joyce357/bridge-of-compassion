// ─── GET / PATCH / DELETE /api/admin/volunteers/[id] ────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { adminVolunteerUpdateSchema } from '@/lib/validations'

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
    const application = await prisma.volunteerApplication.findUnique({
      where: { id },
      include: {
        communications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Volunteer application not found.' }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (err) {
    console.error('[Admin Volunteers/ID GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch application.' }, { status: 500 })
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

    const result = adminVolunteerUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data.', details: result.error.flatten() }, { status: 422 })
    }

    const { status, adminNotes } = result.data

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) {
      updateData.status = status
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes === '' ? null : adminNotes
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update fields provided.' }, { status: 400 })
    }

    const application = await prisma.volunteerApplication.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ application, success: true })
  } catch (err) {
    console.error('[Admin Volunteers/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 })
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
    await prisma.volunteerApplication.delete({
      where: { id },
    })
    return NextResponse.json({ success: true, message: 'Application deleted.' })
  } catch (err) {
    console.error('[Admin Volunteers/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete application.' }, { status: 500 })
  }
}
