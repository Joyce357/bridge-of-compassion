// ─── sitemap.ts ───────────────────────────────────────────────────────────────
// Generates the sitemap.xml for all public routes.
// Only published programs, events, and news posts are included.
// Admin, API, drafts, and private routes are explicitly excluded.

import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getCanonicalUrl } from '@/lib/seo'

const BUILD_DATE = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static public routes ───────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: getCanonicalUrl('/'),             lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 1.0 },
    { url: getCanonicalUrl('/programs'),      lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 0.9 },
    { url: getCanonicalUrl('/events'),        lastModified: BUILD_DATE, changeFrequency: 'daily',   priority: 0.9 },
    { url: getCanonicalUrl('/news'),          lastModified: BUILD_DATE, changeFrequency: 'weekly',  priority: 0.8 },
    { url: getCanonicalUrl('/gallery'),       lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: getCanonicalUrl('/contact'),       lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: getCanonicalUrl('/get-involved'),  lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: getCanonicalUrl('/volunteer'),     lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.7 },
    { url: getCanonicalUrl('/donate'),        lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // ── Dynamic routes: published programs, events, news ──────────────────────
  let programRoutes: MetadataRoute.Sitemap = []
  let eventRoutes: MetadataRoute.Sitemap = []
  let newsRoutes: MetadataRoute.Sitemap = []

  try {
    const [programs, events, newsPosts] = await Promise.all([
      prisma.program.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.event.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.newsPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    programRoutes = programs.map((p) => ({
      url: getCanonicalUrl(`/programs/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    eventRoutes = events.map((e) => ({
      url: getCanonicalUrl(`/events/${e.id}`),
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    newsRoutes = newsPosts.map((n) => ({
      url: getCanonicalUrl(`/news/${n.slug}`),
      lastModified: n.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    // If DB is unavailable during sitemap generation, fall back to static routes only.
    // This prevents a database error from breaking the build.
    console.error('[sitemap] DB query failed, returning static routes only:', err)
  }

  return [...staticRoutes, ...programRoutes, ...eventRoutes, ...newsRoutes]
}
