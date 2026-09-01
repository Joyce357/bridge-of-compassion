// ─── POST /api/donations/create-order ────────────────────────────────────────
// Creates a server-side PayPal order linked to a PENDING Neon Donation record.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDonationOrderSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'
import { isPayPalConfigured, createPayPalOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`donation_order:${ip}`, 10, '10 m')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    // 2. Parse JSON
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }

    // 3. Validate
    const parsed = createDonationOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(parsed.error) },
        { status: 422 },
      )
    }

    const data = parsed.data

    // 4. Verify PayPal Configuration
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        {
          error: 'PayPal integration is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server environment.',
          code: 'PAYPAL_NOT_CONFIGURED',
        },
        { status: 503 },
      )
    }

    // 5. Create PENDING Donation in Neon
    const donation = await prisma.donation.create({
      data: {
        amount:          data.amount,
        currency:        data.currency,
        donorName:       data.isAnonymous ? null : (data.donorName || null),
        donorEmail:      data.donorEmail, // Saved privately for receipt & verification
        donorPhone:      data.donorPhone || null,
        isAnonymous:     data.isAnonymous,
        message:         data.message || null,
        frequency:       'ONE_TIME',
        status:          'PENDING',
        paymentProvider: 'paypal',
      },
    })

    // 6. Create PayPal Order server-side
    let paypalOrder
    try {
      paypalOrder = await createPayPalOrder({
        amount:      Number(data.amount),
        currency:    data.currency,
        donationId:  donation.id,
        donorName:   data.isAnonymous ? 'Anonymous' : (data.donorName || 'Supporter'),
        donorEmail:  data.donorEmail,
        isAnonymous: data.isAnonymous,
      })
    } catch (orderErr) {
      console.error('[Donation Create Order] PayPal order creation failed:', orderErr)
      await prisma.donation.update({
        where: { id: donation.id },
        data:  { status: 'FAILED' },
      }).catch(() => {})
      return NextResponse.json(
        { error: 'Could not create PayPal payment session. Please try again.' },
        { status: 502 },
      )
    }

    // 7. Associate PayPal Order ID with Neon record
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paypalOrderId: paypalOrder.orderId,
        paymentRef:    paypalOrder.orderId,
      },
    })

    return NextResponse.json(
      {
        success:    true,
        orderId:    paypalOrder.orderId,
        donationId: donation.id,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[Donation Create Order] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while preparing your donation.' },
      { status: 500 },
    )
  }
}
