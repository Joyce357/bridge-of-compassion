// ─── Admin: Newsletter Subscribers ───────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewsletterManager from '@/components/admin/NewsletterManager'
import type { Metadata } from 'next'
import type { NewsletterSubscriber } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Newsletter Subscribers | Admin' }

export default async function AdminNewsletterPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const subscribersRaw = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
    take: 500,
  })

  // Normalize/serialize dates safely for Client Component
  const subscribers: NewsletterSubscriber[] = subscribersRaw.map((s) => ({
    id: s.id,
    email: s.email,
    firstName: s.firstName,
    status: s.status,
    subscribedAt: s.subscribedAt.toISOString(),
    unsubscribedAt: s.unsubscribedAt ? s.unsubscribedAt.toISOString() : null,
  }))

  return <NewsletterManager initialSubscribers={subscribers} />
}
