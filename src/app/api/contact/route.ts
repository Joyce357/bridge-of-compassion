// ─── POST /api/contact ────────────────────────────────────────────────────
// Validates, rate-limits, stores, and notifies admin of contact submissions.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'
import { notifyAdminContact } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`contact:${ip}`, 5, '10 m')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: rl.reset
            ? { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) }
            : {},
        },
      )
    }

    // ── Parse & validate ──────────────────────────────────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    const result = contactSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    // ── Store in database ─────────────────────────────────────────────────
    const submission = await prisma.contactSubmission.create({
      data: {
        name:    data.name,
        email:   data.email,
        phone:   data.phone || null,
        subject: data.subject,
        message: data.message,
      },
    })

    // ── Notify admin (non-blocking) ───────────────────────────────────────
    notifyAdminContact(data).catch((err) =>
      console.error('[Contact API] Failed to send admin notification:', err),
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out. We will be in touch shortly.',
        id:      submission.id,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Contact API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
