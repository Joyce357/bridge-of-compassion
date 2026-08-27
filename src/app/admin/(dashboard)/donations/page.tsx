// ─── Admin: Donations ─────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Donations' }

export default async function AdminDonationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark">Donations</h1>
        <p className="text-ink-muted text-sm mt-1">{donations.length} total records</p>
      </div>

      {/* Payment provider notice */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        <strong>Payment provider not yet connected.</strong> Donation records show <em>INTENT</em> status.
        A donation moves to <em>COMPLETED</em> only when a real payment provider confirms the transaction.
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {donations.length === 0 ? (
          <EmptyState
            icon="💙"
            title="No donation records yet"
            message="Donation intents submitted via the donation form will appear here once the database is connected."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Donor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Frequency</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {d.isAnonymous ? 'Anonymous' : (d.donorName ?? 'Unknown')}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-text-dark">
                      {d.currency} ${Number(d.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      {d.frequency === 'ONE_TIME' ? 'One-Time' : d.frequency === 'MONTHLY' ? 'Monthly' : 'Annual'}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs">{d.paymentProvider ?? '—'}</td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString('en-CA', {
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
