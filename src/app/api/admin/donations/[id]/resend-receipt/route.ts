// ─── POST /api/admin/donations/[id]/resend-receipt ─────────────────────────
// Admin-protected endpoint to dispatch receipt to the donor's recorded email address.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { sendDonationReceiptEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const donationId = params.id

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Donation record not found.' }, { status: 404 })
    }

    if (donation.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Receipts can only be sent for confirmed COMPLETED donations.' },
        { status: 400 },
      )
    }

    if (!donation.donorEmail) {
      return NextResponse.json(
        { error: 'No donor email address is associated with this donation record.' },
        { status: 400 },
      )
    }

    // Dispatch receipt email
    const emailResult = await sendDonationReceiptEmail({
      recipientEmail:  donation.donorEmail,
      donorName:       donation.isAnonymous ? null : donation.donorName,
      amount:          donation.amount.toString(),
      currency:        donation.currency,
      donationDate:    donation.createdAt,
      paypalCaptureId: donation.paypalCaptureId,
      paypalOrderId:   donation.paypalOrderId,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.error || 'Email provider failed to accept the receipt email.',
          receiptSent: false,
        },
        { status: 502 },
      )
    }

    // Update receipt timestamps upon provider acceptance
    const updated = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        receiptSent:   true,
        receiptSentAt: new Date(),
      },
    })

    return NextResponse.json({
      success:       true,
      message:       `Receipt successfully sent to ${donation.donorEmail}.`,
      receiptSent:   true,
      receiptSentAt: updated.receiptSentAt,
    })
  } catch (err) {
    console.error('[Admin Resend Receipt] Error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending the receipt.' },
      { status: 500 },
    )
  }
}
