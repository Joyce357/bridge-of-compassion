// ─── POST /api/newsletter ─────────────────────────────────────────────────
// Subscribe an email to the newsletter with duplicate protection.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsletterSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`newsletter:${ip}`, 5, '10 m')
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

    const result = newsletterSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const { email, firstName } = result.data

    // ── Duplicate / re-subscribe check ────────────────────────────────────
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.status === 'ACTIVE') {
        // Return 200 (not 409) to avoid email enumeration
        return NextResponse.json(
          { success: true, message: 'You are already subscribed. Thank you!' },
          { status: 200 },
        )
      }

      // Re-subscribe
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          status:         'ACTIVE',
          firstName:      firstName || existing.firstName,
          unsubscribedAt: null,
          subscribedAt:   new Date(),
        },
      })

      return NextResponse.json(
        { success: true, message: 'Welcome back! You have been re-subscribed.' },
        { status: 200 },
      )
    }

    // ── New subscriber ─────────────────────────────────────────────────────
    await prisma.newsletterSubscriber.create({
      data: { email, firstName: firstName || null },
    })

    return NextResponse.json(
      { success: true, message: 'Thank you for subscribing!' },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Newsletter API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
