// ─── Email Service Abstraction ────────────────────────────────────────────
// All email sending goes through this module.
// Currently: logs to console in development, stubs in production.
// To connect Resend: install `resend`, add RESEND_API_KEY to .env.local,
// and implement the sendEmail function below.
//
// Integration point:
//   import { Resend } from 'resend'
//   const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailPayload {
  to:       string | string[]
  subject:  string
  html:     string
  text?:    string
  from?:    string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'no-reply@bridgeofcompassion.org'

/**
 * Send an email through the configured provider.
 *
 * In development without RESEND_API_KEY: logs to console.
 * In production without RESEND_API_KEY: logs an error and returns failure.
 * When RESEND_API_KEY is set: sends via Resend.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, html, text, from = FROM_ADDRESS, replyTo } = payload

  // ── Resend integration point ──────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      // Uncomment and use once `resend` package is installed:
      // const { Resend } = await import('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // const result = await resend.emails.send({ from, to, subject, html, text, reply_to: replyTo })
      // return { success: true, messageId: result.data?.id }
      console.warn('[Email] RESEND_API_KEY is set but Resend integration is not yet wired up.')
      return { success: false, error: 'Email provider not yet integrated.' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Email] Failed to send via Resend:', message)
      return { success: false, error: message }
    }
  }

  // ── No provider configured ────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[Email] CRITICAL: No email provider configured in production.',
      'Set RESEND_API_KEY to enable email notifications.',
    )
    return { success: false, error: 'Email provider not configured.' }
  }

  // Development: log to console for debugging, but report provider as not connected
  console.log('\n──────────────── [DEV EMAIL (NO PROVIDER)] ────────────────')
  console.log(`To:       ${Array.isArray(to) ? to.join(', ') : to}`)
  console.log(`From:     ${from}`)
  if (replyTo) {
    console.log(`Reply-To: ${replyTo}`)
  }
  console.log(`Subject:  ${subject}`)
  console.log(`Body:\n${text ?? html}`)
  console.log('───────────────────────────────────────────────────────────\n')

  return { success: false, error: 'Email provider not configured (logged to dev console).' }

}

/**
 * Notify the admin of a new contact form submission.
 */
export async function notifyAdminContact(data: {
  name:    string
  email:   string
  subject: string
  message: string
}): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bridgeofcompassion.org'
  return sendEmail({
    to:      adminEmail,
    subject: `[Contact] ${data.subject} — from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${data.message.replace(/\n/g, '<br>')}</blockquote>
    `,
    text: `New contact from ${data.name} (${data.email})\n\nSubject: ${data.subject}\n\n${data.message}`,
  })
}

/**
 * Notify the admin of a new volunteer application.
 */
export async function notifyAdminVolunteer(data: {
  firstName:    string
  lastName:     string
  email:        string
  interests:    string[]
  availability: string
}): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bridgeofcompassion.org'
  return sendEmail({
    to:      adminEmail,
    subject: `[Volunteer] New application from ${data.firstName} ${data.lastName}`,
    html: `
      <h2>New Volunteer Application</h2>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Interests:</strong> ${data.interests.join(', ')}</p>
      <p><strong>Availability:</strong> ${data.availability}</p>
    `,
    text: `New volunteer: ${data.firstName} ${data.lastName} (${data.email})\nInterests: ${data.interests.join(', ')}\nAvailability: ${data.availability}`,
  })
}

/**
 * Send an email reply from Bridge of Compassion to a volunteer applicant.
 */
export async function sendVolunteerReplyEmail(data: {
  recipientEmail: string
  recipientName:  string
  subject:        string
  message:        string
}): Promise<EmailResult> {
  const replyTo = process.env.ADMIN_EMAIL ?? 'admin@bridgeofcompassion.org'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2826; background-color: #fcfbf7; margin: 0; padding: 24px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2ebd8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background-color: #122921; color: #fcfbf7; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .content { padding: 28px 24px; font-size: 15px; color: #2d3748; }
          .message-box { background: #f8faf6; border-left: 4px solid #2d6a4f; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 20px 0; font-size: 14.5px; color: #1c2826; }
          .footer { background: #f8faf6; border-top: 1px solid #e2ebd8; padding: 20px 24px; font-size: 12px; color: #718096; text-align: center; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bridge of Compassion</h1>
            <p>Volunteer Application Update</p>
          </div>
          <div class="content">
            <p>Hello ${data.recipientName},</p>
            <div class="message-box">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
            <p>Thank you for your interest and commitment to our community and the natural world.</p>
            <p>Warm regards,<br><strong>Bridge of Compassion Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>Bridge of Compassion</strong></p>
            <p>Nurturing Children • Protecting Nature • Building Futures</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Bridge of Compassion — Volunteer Application Update\n\nHello ${data.recipientName},\n\n${data.message}\n\nThank you for your commitment to our community and the natural world.\n\nWarm regards,\nBridge of Compassion Team\n\n---\nBridge of Compassion\nNurturing Children • Protecting Nature • Building Futures`

  return sendEmail({
    to:      data.recipientEmail,
    subject: data.subject,
    html,
    text,
    replyTo,
  })
}

/**
 * Send an email reply from Bridge of Compassion to a contact inquiry submitter.
 * FROM: EMAIL_FROM env var (org sender)
 * Reply-To: ADMIN_EMAIL env var (admin@bridgeofcompassion.org)
 * TO: contact submitter's email — always sourced from the DB record, never from browser input
 */
export async function sendContactReplyEmail(data: {
  recipientEmail: string
  recipientName:  string
  subject:        string
  message:        string
}): Promise<EmailResult> {
  const replyTo = process.env.ADMIN_EMAIL ?? 'admin@bridgeofcompassion.org'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2826; background-color: #fcfbf7; margin: 0; padding: 24px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2ebd8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background-color: #122921; color: #fcfbf7; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .content { padding: 28px 24px; font-size: 15px; color: #2d3748; }
          .message-box { background: #f8faf6; border-left: 4px solid #2d6a4f; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 20px 0; font-size: 14.5px; color: #1c2826; }
          .footer { background: #f8faf6; border-top: 1px solid #e2ebd8; padding: 20px 24px; font-size: 12px; color: #718096; text-align: center; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bridge of Compassion</h1>
            <p>Response to Your Inquiry</p>
          </div>
          <div class="content">
            <p>Hello ${data.recipientName},</p>
            <p>Thank you for reaching out to us. Here is our response to your message:</p>
            <div class="message-box">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
            <p>If you have any further questions, please reply to this email or contact us directly.</p>
            <p>Warm regards,<br><strong>Bridge of Compassion Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>Bridge of Compassion</strong></p>
            <p>Nurturing Children • Protecting Nature • Building Futures</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Bridge of Compassion — Response to Your Inquiry\n\nHello ${data.recipientName},\n\nThank you for reaching out to us. Here is our response:\n\n${data.message}\n\nIf you have further questions, please reply to this email or contact us directly.\n\nWarm regards,\nBridge of Compassion Team\n\n---\nBridge of Compassion\nNurturing Children • Protecting Nature • Building Futures`

  return sendEmail({
    to:      data.recipientEmail,
    subject: data.subject,
    html,
    text,
    replyTo,
  })
}

/**
 * Send a formal donation receipt/acknowledgement email to the donor.
 * TO: Always sourced directly from the verified donation record.
 * LEGAL: Explicitly states it is a donation acknowledgement and not an official charitable tax receipt.
 */
export async function sendDonationReceiptEmail(data: {
  recipientEmail: string
  donorName?:     string | null
  amount:         string | number
  currency:       string
  donationDate:   Date | string
  paypalCaptureId?: string | null
  paypalOrderId?:   string | null
}): Promise<EmailResult> {
  const replyTo = process.env.ADMIN_EMAIL ?? 'admin@bridgeofcompassion.org'
  const displayDonor = data.donorName?.trim() || 'Valued Supporter'
  const formattedAmount = Number(data.amount).toFixed(2)
  const formattedDate = new Date(data.donationDate).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const referenceId = data.paypalCaptureId || data.paypalOrderId || 'REF-PENDING'
  const subject = `Donation Receipt — Bridge of Compassion (Ref: ${referenceId})`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2826; background-color: #fcfbf7; margin: 0; padding: 24px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2ebd8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background-color: #122921; color: #fcfbf7; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .content { padding: 28px 24px; font-size: 15px; color: #2d3748; }
          .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8faf6; border-radius: 12px; overflow: hidden; border: 1px solid #e2ebd8; }
          .receipt-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #eef3e8; }
          .receipt-table tr:last-child td { border-bottom: none; }
          .receipt-table .label { font-weight: 600; color: #4a5568; width: 40%; }
          .receipt-table .value { font-weight: 700; color: #122921; text-align: right; }
          .total-row { background: #eef7ee; }
          .total-row .value { font-size: 16px; color: #1b4332; }
          .disclaimer { background: #fdfbf7; border: 1px solid #fae8c8; border-radius: 10px; padding: 14px 16px; margin: 24px 0 16px; font-size: 12px; color: #78350f; line-height: 1.5; }
          .footer { background: #f8faf6; border-top: 1px solid #e2ebd8; padding: 20px 24px; font-size: 12px; color: #718096; text-align: center; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bridge of Compassion</h1>
            <p>Donation Acknowledgement</p>
          </div>
          <div class="content">
            <p>Hello ${displayDonor},</p>
            <p>Thank you for supporting Bridge of Compassion. Your generous gift is greatly appreciated.</p>
            
            <table class="receipt-table">
              <tr>
                <td class="label">Donor Name</td>
                <td class="value">${displayDonor}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">${formattedDate}</td>
              </tr>
              <tr>
                <td class="label">Payment Method</td>
                <td class="value">PayPal</td>
              </tr>
              ${data.paypalCaptureId ? `
              <tr>
                <td class="label">Transaction Ref</td>
                <td class="value" style="font-family: monospace; font-size: 13px;">${data.paypalCaptureId}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td class="label">Donation Amount</td>
                <td class="value">${data.currency} $${formattedAmount}</td>
              </tr>
            </table>

            <div class="disclaimer">
              <strong>Notice:</strong> This acknowledgement confirms your payment and is not represented as an official charitable tax receipt.
            </div>

            <p style="margin-top: 20px;">If you have any questions regarding your donation, please reply directly to this email.</p>
            <p>Warm regards,<br><strong>Bridge of Compassion Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>Bridge of Compassion</strong></p>
            <p>Nurturing Children • Protecting Nature • Building Futures</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Bridge of Compassion — Donation Acknowledgement\n\nHello ${displayDonor},\n\nThank you for supporting Bridge of Compassion. Your generous gift is greatly appreciated.\n\nDonation Summary:\n- Donor: ${displayDonor}\n- Date: ${formattedDate}\n- Amount: ${data.currency} $${formattedAmount}\n- Payment Method: PayPal\n- Reference ID: ${referenceId}\n\nNotice: This acknowledgement confirms your payment and is not represented as an official charitable tax receipt.\n\nWarm regards,\nBridge of Compassion Team\n\n---\nBridge of Compassion\nNurturing Children • Protecting Nature • Building Futures`

  return sendEmail({
    to:      data.recipientEmail,
    subject,
    html,
    text,
    replyTo,
  })
}

