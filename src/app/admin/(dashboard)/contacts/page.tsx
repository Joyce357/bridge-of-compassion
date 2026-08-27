// ─── Admin: Contact Submissions ───────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacts' }

export default async function AdminContactsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark">Contact Submissions</h1>
        <p className="text-ink-muted text-sm mt-1">{submissions.length} total submissions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {submissions.length === 0 ? (
          <EmptyState
            icon="✉️"
            title="No contact submissions yet"
            message="When visitors submit the contact form, their messages will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink">{s.name}</td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      <a href={`mailto:${s.email}`} className="hover:text-green-700">{s.email}</a>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted max-w-xs truncate">{s.subject}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString('en-CA', {
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

      {/* Message preview section */}
      {submissions.length > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800">
          💡 <strong>Tip:</strong> Status management (mark as Read/Replied/Archived) can be done via the API at{' '}
          <code className="bg-blue-100 px-1 rounded">PATCH /api/admin/contacts/[id]</code>
        </div>
      )}
    </div>
  )
}
