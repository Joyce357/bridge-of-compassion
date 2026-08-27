// ─── POST /api/volunteer ──────────────────────────────────────────────────
// Validates, rate-limits, stores, and notifies admin of volunteer applications.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { volunteerSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'
import { notifyAdminVolunteer } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`volunteer:${ip}`, 3, '30 m')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    // ── Parse & validate ──────────────────────────────────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    const result = volunteerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    // ── Store in database ─────────────────────────────────────────────────
    const application = await prisma.volunteerApplication.create({
      data: {
        firstName:    data.firstName,
        lastName:     data.lastName,
        email:        data.email,
        phone:        data.phone || null,
        location:     data.location || null,
        interests:    data.interests,
        availability: data.availability,
        message:      data.message || null,
        consent:      data.consent,
      },
    })

    // ── Notify admin (non-blocking) ───────────────────────────────────────
    notifyAdminVolunteer(data).catch((err) =>
      console.error('[Volunteer API] Failed to send admin notification:', err),
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your application! We will be in touch soon.',
        id:      application.id,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Volunteer API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
