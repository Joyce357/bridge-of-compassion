// ─── Admin: Volunteer Applications ───────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import VolunteersManager from '@/components/admin/VolunteersManager'
import type { Metadata } from 'next'
import type { VolunteerApplication } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Volunteer Applications | Admin',
  description: 'Manage community volunteer applications and applicant workflow.',
}

export default async function AdminVolunteersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const rawApplications = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      communications: {
        orderBy: { createdAt: 'desc' },
      },
    },
    take: 100,
  })

  const initialApplications: VolunteerApplication[] = rawApplications.map((v) => ({
    id: v.id,
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    phone: v.phone,
    location: v.location,
    interests: v.interests,
    availability: v.availability,
    message: v.message,
    consent: v.consent,
    status: v.status,
    adminNotes: v.adminNotes,
    communications: v.communications.map((c) => ({
      id: c.id,
      volunteerApplicationId: c.volunteerApplicationId,
      subject: c.subject,
      message: c.message,
      recipientEmail: c.recipientEmail,
      sentByUserId: c.sentByUserId,
      sentByName: c.sentByName,
      sentAt: c.sentAt.toISOString(),
      deliveryStatus: c.deliveryStatus,
      providerMessageId: c.providerMessageId,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }))

  return (
    <VolunteersManager
      initialApplications={initialApplications}
    />
  )
}
