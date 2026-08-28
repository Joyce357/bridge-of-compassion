// ─── Gallery Query & Utilities Layer ──────────────────────────────────────
// Authoritative queries against Neon PostgreSQL.
// Draft items are NEVER leaked through public query functions.

import { prisma } from './prisma'
import type { GalleryItem } from '@/types'
export {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  getGalleryCategoryStyle,
} from './validations'

/**
 * Returns all PUBLISHED gallery items, ordered by manual displayOrder ascending,
 * with createdAt descending as fallback.
 * Public safe.
 */
export async function getPublishedGalleryItems(category?: string): Promise<GalleryItem[]> {
  try {
    const where: { published: boolean; category?: string } = { published: true }
    if (category && category !== 'ALL') {
      where.category = category
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    return items as unknown as GalleryItem[]
  } catch (err) {
    console.error('[getPublishedGalleryItems] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns featured published gallery items.
 */
export async function getFeaturedGalleryItems(limit = 6): Promise<GalleryItem[]> {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { published: true, featured: true },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
    return items as unknown as GalleryItem[]
  } catch (err) {
    console.error('[getFeaturedGalleryItems] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns all gallery items for the admin dashboard (both drafts and published).
 * Internal admin use only.
 */
export async function getAdminGalleryItems(): Promise<GalleryItem[]> {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    return items as unknown as GalleryItem[]
  } catch (err) {
    console.error('[getAdminGalleryItems] DB query failed:', (err as Error)?.message)
    return []
  }
}

/**
 * Returns a gallery item by ID for admin operations.
 */
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    })
    return item ? (item as unknown as GalleryItem) : null
  } catch (err) {
    console.error('[getGalleryItemById] DB query failed:', (err as Error)?.message)
    return null
  }
}

/**
 * Computes the next display order for newly created gallery items.
 */
export async function getNextDisplayOrder(): Promise<number> {
  try {
    const highest = await prisma.galleryItem.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    })
    return (highest?.displayOrder ?? 0) + 1
  } catch {
    return 1
  }
}
