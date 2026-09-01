// ─── POST /api/admin/contacts/[id]/reply ──────────────────────────────────
// Sends an email reply to the contact inquiry submitter and records
// communication history. Only records as sent after the provider reports success.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { contactReplySchema } from '@/lib/validations'
import { sendContactReplyEmail } from '@/lib/email'

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

    // ── Parse & validate body ─────────────────────────────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = contactReplySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: result.error.flatten() },
        { status: 422 },
      )
    }

    const { subject, message } = result.data

    // ── Fetch submission from Neon ─────────────────────────────────────────
    // Recipient email is always derived from the DB record — never from browser input.
    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Contact submission not found.' }, { status: 404 })
    }

    // ── Send email via server-side helper ─────────────────────────────────
    const emailResult = await sendContactReplyEmail({
      recipientEmail: submission.email,
      recipientName:  submission.name,
      subject,
      message,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email reply. Please check mail settings.' },
        { status: 500 },
      )
    }

    // ── Record communication ONLY after provider reports success ──────────
    const communication = await prisma.contactCommunication.create({
      data: {
        contactSubmissionId: submission.id,
        subject,
        message,
        recipientEmail:    submission.email,
        sentByUserId:      session.user.id || null,
        sentByName:        session.user.name || session.user.email || 'Admin',
        deliveryStatus:    'SENT',
        providerMessageId: emailResult.messageId || null,
      },
    })

    // ── Auto-promote status: NEW or READ → REPLIED ────────────────────────
    let newStatus = submission.status
    if (submission.status === 'NEW' || submission.status === 'READ') {
      const updated = await prisma.contactSubmission.update({
        where: { id: submission.id },
        data:  { status: 'REPLIED' },
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
    console.error('[Admin Contacts Reply API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending the reply.' },
      { status: 500 },
    )
  }
}
