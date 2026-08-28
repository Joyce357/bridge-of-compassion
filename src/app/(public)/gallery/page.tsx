// ─── Gallery Page ─────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import { getPublishedGalleryItems } from '@/lib/gallery'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from Bridge of Compassion events, programs, and community conservation activities.',
  alternates: { canonical: 'https://bridgeofcompassion.org/gallery' },
}

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const items = await getPublishedGalleryItems()

  return (
    <>
      {/* Hero Section */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <Container className="text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-3">Our Community &amp; Work</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-brand-warm-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A visual journey through our environmental stewardship initiatives, youth programs, and community restoration projects.
          </p>
        </Container>
      </section>

      {/* Main Gallery Section */}
      <section className="section-py bg-brand-warm-white">
        <Container>
          <GalleryGrid initialItems={items} />
        </Container>
      </section>
    </>
  )
}
