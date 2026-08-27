// ─── Admin: Gallery ───────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gallery' }

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [items, total] = await Promise.all([
    prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.galleryItem.count(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark">Gallery</h1>
        <p className="text-ink-muted text-sm mt-1">{total} total items</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon="🖼️"
            title="No gallery items yet"
            message="Gallery images will appear here once added. Use the API to upload items."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Caption</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-ink max-w-xs truncate">{item.caption ?? '(no caption)'}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{item.category ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.published ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                    <td className="px-5 py-3.5 text-ink-subtle text-xs whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-CA', {
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
