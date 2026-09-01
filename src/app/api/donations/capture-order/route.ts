// ─── POST /api/donations/capture-order ────────────────────────────────────────
// Server-authoritative PayPal order capture and verification endpoint.
// Marks Donation as COMPLETED only after PayPal confirmation and triggers receipt workflow.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { captureDonationOrderSchema, formatZodErrors } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'
import { isPayPalConfigured, capturePayPalOrder } from '@/lib/paypal'
import { sendDonationReceiptEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = getClientIP(req)
    const rl = await checkRateLimit(`donation_capture:${ip}`, 15, '10 m')
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
    const parsed = captureDonationOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(parsed.error) },
        { status: 422 },
      )
    }

    const { orderId, donationId } = parsed.data

    // 4. Verify PayPal Configuration
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        {
          error: 'PayPal integration is not configured.',
          code: 'PAYPAL_NOT_CONFIGURED',
        },
        { status: 503 },
      )
    }

    // 5. Locate matching Neon Donation record
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { id: donationId },
          { paypalOrderId: orderId },
        ],
      },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Matching donation record not found.' },
        { status: 404 },
      )
    }

    // 6. Idempotency check: If already COMPLETED, avoid duplicate capture & duplicate receipt
    if (donation.status === 'COMPLETED') {
      return NextResponse.json({
        success:         true,
        alreadyCaptured: true,
        donationId:      donation.id,
        captureId:       donation.paypalCaptureId,
      })
    }

    // 7. Server-to-server PayPal Capture
    let captureResult
    try {
      captureResult = await capturePayPalOrder(orderId)
    } catch (captureErr) {
      console.error('[Donation Capture] PayPal capture call failed:', captureErr)
      await prisma.donation.update({
        where: { id: donation.id },
        data:  { status: 'FAILED' },
      }).catch(() => {})
      return NextResponse.json(
        { error: (captureErr as Error)?.message || 'Failed to capture PayPal payment.' },
        { status: 502 },
      )
    }

    // 8. Verify capture status
    if (captureResult.status !== 'COMPLETED') {
      console.warn('[Donation Capture] Capture status is not COMPLETED:', captureResult.status)
      await prisma.donation.update({
        where: { id: donation.id },
        data:  { status: 'FAILED' },
      }).catch(() => {})
      return NextResponse.json(
        { error: `Payment capture incomplete (status: ${captureResult.status}).` },
        { status: 400 },
      )
    }

    // 9. Precision verification of amount & currency
    if (captureResult.capturedAmount) {
      const capturedAmountNum = parseFloat(captureResult.capturedAmount)
      const expectedAmountNum = Number(donation.amount)
      if (Math.abs(capturedAmountNum - expectedAmountNum) > 0.009) {
        console.error('[Donation Capture] Amount mismatch!', {
          captured: capturedAmountNum,
          expected: expectedAmountNum,
        })
        return NextResponse.json(
          { error: 'Payment amount does not match the donation record.' },
          { status: 400 },
        )
      }
    }

    if (captureResult.capturedCurrency && captureResult.capturedCurrency.toUpperCase() !== donation.currency.toUpperCase()) {
      console.error('[Donation Capture] Currency mismatch!', {
        captured: captureResult.capturedCurrency,
        expected: donation.currency,
      })
      return NextResponse.json(
        { error: 'Payment currency does not match the donation record.' },
        { status: 400 },
      )
    }

    // 10. Update Neon record to COMPLETED
    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status:           'COMPLETED',
        paypalCaptureId:  captureResult.captureId || null,
        paypalOrderId:    orderId,
        paymentRef:       captureResult.captureId || orderId,
        paypalPayerId:    captureResult.payerId || null,
        paypalPayerEmail: captureResult.payerEmail || null,
      },
    })

    // 11. Trigger Donor Email Receipt Workflow
    // Payment success must NEVER be reversed if email delivery fails.
    if (updatedDonation.donorEmail) {
      try {
        const emailRes = await sendDonationReceiptEmail({
          recipientEmail:  updatedDonation.donorEmail,
          donorName:       updatedDonation.isAnonymous ? null : updatedDonation.donorName,
          amount:          updatedDonation.amount.toString(),
          currency:        updatedDonation.currency,
          donationDate:    updatedDonation.createdAt,
          paypalCaptureId: updatedDonation.paypalCaptureId,
          paypalOrderId:   updatedDonation.paypalOrderId,
        })

        if (emailRes.success) {
          await prisma.donation.update({
            where: { id: updatedDonation.id },
            data:  { receiptSent: true, receiptSentAt: new Date() },
          }).catch((err) => console.error('[Donation Capture] Failed to update receiptSent flag:', err))
        } else {
          console.warn('[Donation Capture] Receipt email not accepted by provider:', emailRes.error)
        }
      } catch (emailErr) {
        console.error('[Donation Capture] Error dispatching receipt email:', emailErr)
      }
    }

    return NextResponse.json({
      success:    true,
      donationId: updatedDonation.id,
      captureId:  updatedDonation.paypalCaptureId,
      status:     'COMPLETED',
    })
  } catch (err) {
    console.error('[Donation Capture] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while verifying your payment.' },
      { status: 500 },
    )
  }
}
