// ─── Admin: News ──────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewsManager from '@/components/admin/NewsManager'
import type { Metadata } from 'next'
import type { NewsPost } from '@/types'

export const metadata: Metadata = { title: 'News' }
export const dynamic = 'force-dynamic'

export default async function AdminNewsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let posts: NewsPost[] = []
  let total = 0
  let dbError = false

  try {
    const [dbPosts, count] = await Promise.all([
      prisma.newsPost.findMany({
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
      }),
      prisma.newsPost.count(),
    ])
    posts = dbPosts as unknown as NewsPost[]
    total = count
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
    <NewsManager
      initialPosts={posts}
      totalCount={total}
    />
  )
}
