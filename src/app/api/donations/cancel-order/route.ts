// ─── POST /api/donations/cancel-order ─────────────────────────────────────────
// Server-authoritative cancellation endpoint when a donor closes or cancels a PayPal checkout session.
// Updates PENDING records to CANCELLED. Strictly prevents overwriting COMPLETED or REFUNDED records.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelDonationOrderSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`donation_cancel:${ip}`, 20, '10 m')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    // 2. Parse payload
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }

    // 3. Validate
    const parsed = cancelDonationOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(parsed.error) },
        { status: 422 },
      )
    }

    const { orderId, donationId } = parsed.data

    // 4. Locate matching Neon Donation record
    const donation = await prisma.donation.findFirst({
      where: {
        id: donationId,
        paypalOrderId: orderId,
      },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Matching donation order not found.' },
        { status: 404 },
      )
    }

    // 5. Protect COMPLETED and REFUNDED records
    if (donation.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed donation.' },
        { status: 400 },
      )
    }

    if (donation.status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Cannot cancel a refunded donation.' },
        { status: 400 },
      )
    }

    // 6. Idempotency: If already CANCELLED, return success
    if (donation.status === 'CANCELLED') {
      return NextResponse.json({
        success:          true,
        alreadyCancelled: true,
        donationId:       donation.id,
        status:           'CANCELLED',
      })
    }

    // 7. Update status to CANCELLED
    const updated = await prisma.donation.update({
      where: { id: donation.id },
      data:  { status: 'CANCELLED' },
    })

    return NextResponse.json({
      success:    true,
      donationId: updated.id,
      status:     'CANCELLED',
    })
  } catch (err) {
    console.error('[Donation Cancel Order] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while cancelling your donation.' },
      { status: 500 },
    )
  }
}
