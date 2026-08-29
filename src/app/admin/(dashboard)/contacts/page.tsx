// ─── Admin: Contact Inquiries ─────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ContactsManager from '@/components/admin/ContactsManager'
import type { Metadata } from 'next'
import type { ContactSubmission, ContactCommunication } from '@/types'

export const metadata: Metadata = { title: 'Contact Inquiries' }
export const dynamic = 'force-dynamic'

export default async function AdminContactsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const rawSubmissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      communications: {
        orderBy: { createdAt: 'desc' },
      },
    },
    take: 100,
  })

  // Serialize Dates to strings for client component
  const initialSubmissions: ContactSubmission[] = rawSubmissions.map((s) => ({
    id:          s.id,
    name:        s.name,
    email:       s.email,
    phone:       s.phone,
    subject:     s.subject,
    message:     s.message,
    status:      s.status as ContactSubmission['status'],
    adminNotes:  s.adminNotes,
    createdAt:   s.createdAt.toISOString(),
    updatedAt:   s.updatedAt.toISOString(),
    communications: s.communications.map((c): ContactCommunication => ({
      id:                  c.id,
      contactSubmissionId: c.contactSubmissionId,
      subject:             c.subject,
      message:             c.message,
      recipientEmail:      c.recipientEmail,
      sentByUserId:        c.sentByUserId,
      sentByName:          c.sentByName,
      sentAt:              c.sentAt.toISOString(),
      deliveryStatus:      c.deliveryStatus,
      providerMessageId:   c.providerMessageId,
      createdAt:           c.createdAt.toISOString(),
    })),
  }))

  return <ContactsManager initialSubmissions={initialSubmissions} />
}
