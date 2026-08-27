// ─── Admin: Volunteer Applications ───────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Volunteers' }

export default async function AdminVolunteersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const applications = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark">Volunteer Applications</h1>
        <p className="text-ink-muted text-sm mt-1">{applications.length} total applications</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {applications.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="No volunteer applications yet"
            message="When people submit the volunteer form, their applications will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Interests</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Availability</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {v.firstName} {v.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      <a href={`mailto:${v.email}`} className="hover:text-green-700">{v.email}</a>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted text-xs max-w-xs">
                      {v.interests.join(', ')}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{v.availability}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleDateString('en-CA', {
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
