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
  to:      string | string[]
  subject: string
  html:    string
  text?:   string
  from?:   string
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
 * When RESEND_API_KEY is set: sends via Resend (integrate below).
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, html, text, from = FROM_ADDRESS } = payload

  // ── Resend integration point ──────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      // Uncomment and use once `resend` package is installed:
      // const { Resend } = await import('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // const result = await resend.emails.send({ from, to, subject, html, text })
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

  // Development: log to console
  console.log('\n──────────────── [DEV EMAIL] ────────────────')
  console.log(`To:      ${Array.isArray(to) ? to.join(', ') : to}`)
  console.log(`From:    ${from}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${text ?? html}`)
  console.log('─────────────────────────────────────────────\n')

  return { success: true, messageId: `dev-${Date.now()}` }
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
