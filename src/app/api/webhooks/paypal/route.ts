// ─── POST /api/webhooks/paypal ──────────────────────────────────────────────
// Secure PayPal webhook receiver with mandatory signature verification.
// Unsigned or unverified events are rejected immediately.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayPalWebhookSignature } from '@/lib/paypal'
import { sendDonationReceiptEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // 1. Check if webhook is configured
    if (!process.env.PAYPAL_WEBHOOK_ID) {
      console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID is not configured. Webhook rejected.')
      return NextResponse.json(
        { error: 'Webhook signature verification is not configured on this server.' },
        { status: 503 },
      )
    }

    // 2. Extract verification headers
    const authAlgo = req.headers.get('paypal-auth-algo')
    const certUrl = req.headers.get('paypal-cert-url')
    const transmissionId = req.headers.get('paypal-transmission-id')
    const transmissionSig = req.headers.get('paypal-transmission-sig')
    const transmissionTime = req.headers.get('paypal-transmission-time')

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    // 3. Cryptographic Signature Verification
    const isVerified = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookEvent: body,
    })

    if (!isVerified) {
      console.warn('[PayPal Webhook] Signature verification failed for transmission ID:', transmissionId)
      return NextResponse.json(
        { error: 'Invalid webhook signature.' },
        { status: 401 },
      )
    }

    const eventType = String(body.event_type || '')
    const resource = (body.resource as Record<string, unknown>) || {}

    // 4. Idempotent Event Handlers
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const captureId = typeof resource.id === 'string' ? resource.id : ''
        const customId = typeof resource.custom_id === 'string' ? resource.custom_id : ''
        const supplementary = resource.supplementary_data as Record<string, unknown> | undefined
        const relatedIds = supplementary?.related_ids as Record<string, unknown> | undefined
        const orderId = typeof relatedIds?.order_id === 'string' ? relatedIds.order_id : ''

        const donation = await prisma.donation.findFirst({
          where: {
            OR: [
              ...(customId ? [{ id: customId }] : []),
              ...(captureId ? [{ paypalCaptureId: captureId }] : []),
              ...(orderId ? [{ paypalOrderId: orderId }] : []),
            ],
          },
        })

        if (!donation) {
          console.warn('[PayPal Webhook] No matching donation for capture:', captureId)
          break
        }

        if (donation.status !== 'COMPLETED') {
          const updated = await prisma.donation.update({
            where: { id: donation.id },
            data: {
              status:          'COMPLETED',
              paypalCaptureId: captureId || donation.paypalCaptureId,
              paypalOrderId:   orderId || donation.paypalOrderId,
              paymentRef:      captureId || donation.paymentRef,
            },
          })

          // Send receipt if not yet sent
          if (!updated.receiptSent && updated.donorEmail) {
            try {
              const res = await sendDonationReceiptEmail({
                recipientEmail:  updated.donorEmail,
                donorName:       updated.isAnonymous ? null : updated.donorName,
                amount:          updated.amount.toString(),
                currency:        updated.currency,
                donationDate:    updated.createdAt,
                paypalCaptureId: updated.paypalCaptureId,
                paypalOrderId:   updated.paypalOrderId,
              })
              if (res.success) {
                await prisma.donation.update({
                  where: { id: updated.id },
                  data:  { receiptSent: true, receiptSentAt: new Date() },
                }).catch(() => {})
              }
            } catch (emailErr) {
              console.error('[PayPal Webhook] Receipt email error:', emailErr)
            }
          }
        }
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const captureId = typeof resource.id === 'string' ? resource.id : ''
        const links = Array.isArray(resource.links) ? (resource.links as Array<{ rel?: string; href?: string }>) : []
        const upLink = links.find((l) => l.rel === 'up')
        const parentCaptureId = typeof upLink?.href === 'string' ? upLink.href.split('/').pop() || '' : ''

        const donation = await prisma.donation.findFirst({
          where: {
            OR: [
              ...(captureId ? [{ paypalCaptureId: captureId }] : []),
              ...(parentCaptureId ? [{ paypalCaptureId: parentCaptureId }] : []),
            ],
          },
        })


        if (donation) {
          await prisma.donation.update({
            where: { id: donation.id },
            data:  { status: 'REFUNDED' },
          })
          console.log(`[PayPal Webhook] Donation ${donation.id} marked as REFUNDED.`)
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const captureId = String(resource.id || '')
        const customId = String(resource.custom_id || '')

        const donation = await prisma.donation.findFirst({
          where: {
            OR: [
              ...(customId ? [{ id: customId }] : []),
              ...(captureId ? [{ paypalCaptureId: captureId }] : []),
            ],
          },
        })

        if (donation && donation.status !== 'COMPLETED') {
          await prisma.donation.update({
            where: { id: donation.id },
            data:  { status: 'FAILED' },
          })
        }
        break
      }

      default:
        // Other events (e.g. CHECKOUT.ORDER.APPROVED) acknowledged without altering final status
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('[PayPal Webhook] Processing error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 },
    )
  }
}
