// ─── Admin: News ──────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'News' }
export const dynamic = 'force-dynamic'

export default async function AdminNewsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let posts: Array<{
    id: string
    title: string
    slug: string
    author: string | null
    published: boolean
    publishedAt: Date | null
    createdAt: Date
  }> = []
  let dbError = false

  try {
    posts = await prisma.newsPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id:          true,
        title:       true,
        slug:        true,
        author:      true,
        published:   true,
        publishedAt: true,
        createdAt:   true,
      },
    })
  } catch (err) {
    console.error('[Admin News Page] DB query failed:', (err as Error)?.message)
    dbError = true
  }

  if (dbError) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-xs">
        <p className="text-red-600 font-bold mb-2">Database temporarily unavailable</p>
        <p className="text-sm text-text-secondary">
          Could not connect to the database. Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">News &amp; Stories</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage published news posts, community stories, and updates. ({posts.length} total)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden">
        {posts.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No news posts yet"
            message="News posts added via the seed or CMS will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-border-soft text-brand-navy font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Slug</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Published Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-warm-white/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-brand-navy max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-4 text-text-secondary font-mono text-xs">{p.slug}</td>
                    <td className="px-4 py-4 text-text-secondary text-xs">{p.author ?? '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={p.published ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                    <td className="px-4 py-4 text-text-secondary text-xs whitespace-nowrap font-medium">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
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
