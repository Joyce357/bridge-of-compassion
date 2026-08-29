// ─── POST /api/admin/volunteers/[id]/reply ─────────────────────────────────
// Sends an email reply to the volunteer applicant and records communication history.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { volunteerReplySchema } from '@/lib/validations'
import { sendVolunteerReplyEmail } from '@/lib/email'

interface RouteContext {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveParams(context: RouteContext): Promise<{ id: string }> {
  if ('then' in context.params) {
    return await context.params
  }
  return context.params
}

export async function POST(
  req: NextRequest,
  context: RouteContext,
) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await resolveParams(context)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = volunteerReplySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: result.error.flatten() },
        { status: 422 },
      )
    }

    const { subject, message } = result.data

    // 1. Fetch applicant from Neon
    const application = await prisma.volunteerApplication.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Volunteer application not found.' }, { status: 404 })
    }

    // 2. Send email via server-side helper (FROM organization email, TO applicant)
    const emailResult = await sendVolunteerReplyEmail({
      recipientEmail: application.email,
      recipientName:  `${application.firstName} ${application.lastName}`,
      subject,
      message,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email reply. Please check mail settings.' },
        { status: 500 },
      )
    }

    // 3. Store communication history in Neon
    const communication = await prisma.volunteerCommunication.create({
      data: {
        volunteerApplicationId: application.id,
        subject,
        message,
        recipientEmail:    application.email,
        sentByUserId:      session.user.id || null,
        sentByName:        session.user.name || session.user.email || 'Admin',
        deliveryStatus:    'SENT',
        providerMessageId: emailResult.messageId || null,
      },
    })

    // 4. Update status to CONTACTED if currently NEW or REVIEWING
    let newStatus = application.status
    if (application.status === 'NEW' || application.status === 'REVIEWING') {
      const updated = await prisma.volunteerApplication.update({
        where: { id: application.id },
        data:  { status: 'CONTACTED' },
      })
      newStatus = updated.status
    }

    return NextResponse.json(
      {
        success:       true,
        message:       'Email reply sent successfully.',
        communication,
        newStatus,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Admin Volunteers Reply API] Error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred while sending reply.' }, { status: 500 })
  }
}
