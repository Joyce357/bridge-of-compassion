// ─── News / Stories Query & Utilities Layer ────────────────────────────────
// Authoritative queries against Neon PostgreSQL.
// Draft posts are NEVER leaked through public query functions.

import { prisma } from './prisma'
import type { NewsPost } from '@/types'
export { NEWS_CATEGORIES, type NewsCategory, getNewsCategoryStyle } from './validations'

/**
 * Returns all PUBLISHED news posts, ordered by newest publishedAt / createdAt.
 * Public safe.
 */
export async function getPublishedNews(): Promise<NewsPost[]> {
  try {
    const posts = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    return posts as unknown as NewsPost[]
  } catch (err) {
    console.error('[getPublishedNews] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns a single PUBLISHED news post by slug.
 * Returns null if not found or if the post is a draft.
 * Public safe.
 */
export async function getPublishedNewsBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const post = await prisma.newsPost.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        published: true,
      },
    })
    return post ? (post as unknown as NewsPost) : null
  } catch (err) {
    console.error('[getPublishedNewsBySlug] DB query failed:', (err as Error)?.message)
    return null
  }
}

/**
 * Returns featured and recent published news posts for the homepage.
 * Prioritizes featured posts first, then recent published posts.
 */
export async function getFeaturedNews(limit = 3): Promise<NewsPost[]> {
  try {
    const posts = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
    return posts as unknown as NewsPost[]
  } catch (err) {
    console.error('[getFeaturedNews] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns recent published news posts.
 */
export async function getRecentNews(limit = 6): Promise<NewsPost[]> {
  try {
    const posts = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
    return posts as unknown as NewsPost[]
  } catch (err) {
    console.error('[getRecentNews] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns all news posts for the admin dashboard (both drafts and published).
 * Internal admin use only.
 */
export async function getAdminNews(): Promise<NewsPost[]> {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: [{ createdAt: 'desc' }],
    })
    return posts as unknown as NewsPost[]
  } catch (err) {
    console.error('[getAdminNews] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns a news post by ID for admin operations.
 */
export async function getNewsById(id: string): Promise<NewsPost | null> {
  try {
    const post = await prisma.newsPost.findUnique({
      where: { id },
    })
    return post ? (post as unknown as NewsPost) : null
  } catch (err) {
    console.error('[getNewsById] DB query failed:', (err as Error)?.message)
    return null
  }
}

