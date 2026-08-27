// ─── POST /api/newsletter/unsubscribe ────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unsubscribeSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    const result = unsubscribeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Valid email address required.' }, { status: 422 })
    }

    const { email } = result.data

    // Always return success to avoid email enumeration
    await prisma.newsletterSubscriber.updateMany({
      where:  { email, status: 'ACTIVE' },
      data:   { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
    })

    return NextResponse.json(
      { success: true, message: 'You have been unsubscribed.' },
      { status: 200 },
    )
  } catch (err) {
    console.error('[Newsletter Unsubscribe API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
