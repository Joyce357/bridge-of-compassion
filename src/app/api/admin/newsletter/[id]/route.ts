// ─── /api/admin/newsletter/[id] ──────────────────────────────────────────
// Protected admin endpoints for single newsletter subscriber operations.
// GET    — fetch subscriber details
// PATCH  — update subscriber status (ACTIVE / UNSUBSCRIBED) or details
// DELETE — permanently delete subscriber

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { adminNewsletterUpdateSchema } from '@/lib/validations'

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

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    })

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 })
    }

    return NextResponse.json({ subscriber })
  } catch (err) {
    console.error('[Admin Newsletter/ID GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load subscriber.' }, { status: 500 })
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

    const result = adminNewsletterUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: result.error.flatten() },
        { status: 422 },
      )
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 })
    }

    const updateData: {
      status?: 'ACTIVE' | 'UNSUBSCRIBED'
      unsubscribedAt?: Date | null
      firstName?: string | null
    } = {}

    if (result.data.status) {
      updateData.status = result.data.status
      if (result.data.status === 'UNSUBSCRIBED') {
        updateData.unsubscribedAt = new Date()
      } else if (result.data.status === 'ACTIVE') {
        updateData.unsubscribedAt = null
      }
    }

    if (result.data.firstName !== undefined) {
      updateData.firstName = result.data.firstName || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided.' }, { status: 400 })
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data:  updateData,
    })

    return NextResponse.json({ subscriber })
  } catch (err) {
    console.error('[Admin Newsletter/ID PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update subscriber.' }, { status: 500 })
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

    await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Admin Newsletter/ID DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete subscriber.' }, { status: 500 })
  }
}
