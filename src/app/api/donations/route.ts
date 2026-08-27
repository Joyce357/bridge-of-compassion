// ─── POST /api/donations ──────────────────────────────────────────────────
// Records a donation intent. Payment provider is NOT connected.
// Status lifecycle: INTENT → PENDING → COMPLETED | FAILED | CANCELLED
// A donation is only COMPLETED when a real payment provider confirms it.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { donationSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`donation:${ip}`, 10, '10 m')
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

    const result = donationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    // ── Record donation intent ────────────────────────────────────────────
    // Status is INTENT — no payment has been processed.
    // paymentProvider and paymentRef remain null until a provider is connected.
    const donation = await prisma.donation.create({
      data: {
        amount:      data.amount,
        currency:    data.currency,
        donorName:   data.isAnonymous ? null : (data.donorName || null),
        donorEmail:  data.isAnonymous ? null : (data.donorEmail || null),
        donorPhone:  data.isAnonymous ? null : (data.donorPhone || null),
        isAnonymous: data.isAnonymous,
        message:     data.message || null,
        frequency:   data.frequency,
        status:      'INTENT',
        // paymentProvider and paymentRef are null until a provider is connected
      },
    })

    // ── Payment provider integration point ────────────────────────────────
    // TODO: When a payment provider is chosen:
    //   1. Call the provider SDK to create a payment session/intent
    //   2. Update donation.status to 'PENDING'
    //   3. Store the provider's session/intent ID in donation.paymentRef
    //   4. Return the provider's checkout URL or client secret to the frontend
    //   5. Handle the provider's webhook to update status to COMPLETED/FAILED

    return NextResponse.json(
      {
        success:    true,
        donationId: donation.id,
        message:    'Donation intent recorded. Payment provider not yet connected.',
        // checkoutUrl: null, // Will be returned when provider is connected
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Donations API] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
