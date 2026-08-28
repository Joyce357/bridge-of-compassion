// ─── Admin: Gallery ───────────────────────────────────────────────────────
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdminGalleryItems } from '@/lib/gallery'
import { prisma } from '@/lib/prisma'
import GalleryManager from '@/components/admin/GalleryManager'

export const metadata: Metadata = { title: 'Photo Gallery | Admin Dashboard' }
export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [items, total] = await Promise.all([
    getAdminGalleryItems(),
    prisma.galleryItem.count(),
  ])

  return <GalleryManager initialItems={items} totalCount={total} />
}
