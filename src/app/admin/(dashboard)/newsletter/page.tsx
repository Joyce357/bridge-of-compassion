// ─── Admin: Newsletter Subscribers ───────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Newsletter' }

export default async function AdminNewsletterPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [subscribers, total, unsubscribed] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where:   { status: 'ACTIVE' },
      orderBy: { subscribedAt: 'desc' },
      take: 100,
    }),
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark">Newsletter Subscribers</h1>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-ink-muted text-sm">{total} active subscribers</p>
          <span className="text-ink-subtle text-sm">·</span>
          <p className="text-ink-subtle text-sm">{unsubscribed} unsubscribed</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {subscribers.length === 0 ? (
          <EmptyState
            icon="📬"
            title="No subscribers yet"
            message="Newsletter subscribers will appear here once people sign up."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-ink font-medium">{s.email}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{s.firstName ?? '—'}</td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs whitespace-nowrap">
                      {new Date(s.subscribedAt).toLocaleDateString('en-CA', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
