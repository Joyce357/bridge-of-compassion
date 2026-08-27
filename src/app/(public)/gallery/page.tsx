// ─── Gallery Page ─────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from Bridge of Compassion events, programs, and community activities.',
  alternates: { canonical: 'https://bridgeofcompassion.org/gallery' },
}

async function getGalleryItems() {
  try {
    return await prisma.galleryItem.findMany({
      where:   { published: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems()

  return (
    <>
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-boc text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">Our Community</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">Gallery</h1>
          <p className="text-brand-warm-white/80 text-lg max-w-xl mx-auto">
            A look at our environmental programs, youth workshops, and community conservation days.
          </p>
        </div>
      </section>

      <section className="section-py bg-brand-warm-white">
        <div className="container-boc">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🖼️</p>
              <h2 className="text-xl font-bold text-brand-navy mb-2">Gallery Coming Soon</h2>
              <p className="text-text-secondary max-w-sm mx-auto">
                Photos from our events and programs will be added here. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <figure key={item.id} className="group overflow-hidden rounded-2xl shadow-card border border-border-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.caption ?? ''}
                    className="w-full aspect-card object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.caption && (
                    <figcaption className="px-4 py-3 text-sm text-text-secondary bg-brand-warm-white">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
