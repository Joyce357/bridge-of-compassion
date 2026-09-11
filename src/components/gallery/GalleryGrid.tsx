// ─── Public Gallery Grid with Lightbox ─────────────────────────────────────
'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types'
import { GALLERY_CATEGORIES, getGalleryCategoryStyle } from '@/lib/validations'
import GalleryLightbox from '@/components/ui/GalleryLightbox'

interface GalleryGridProps {
  initialItems: GalleryItem[]
}

export default function GalleryGrid({ initialItems }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredItems = initialItems.filter((item) => {
    if (selectedCategory === 'ALL') return true
    return item.category === selectedCategory
  })

  // Extract all categories that actually have items
  const activeCategories = Array.from(
    new Set(initialItems.map((item) => item.category).filter(Boolean)),
  )

  const availableCategories = ['ALL', ...(activeCategories.length > 0 ? activeCategories : GALLERY_CATEGORIES)]

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  return (
    <>
      {/* Category Filter Tabs */}
      {initialItems.length > 0 && availableCategories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as string)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-navy dark:bg-brand-cyan text-white dark:text-brand-navy-dark shadow-xs'
                    : 'bg-white dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary hover:text-brand-navy dark:hover:text-dark-text-primary hover:bg-brand-cream/60 dark:hover:bg-dark-card border border-border-soft dark:border-dark-border'
                }`}
              >
                {cat === 'ALL' ? 'All Photos' : cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Grid or Empty state */}
      {filteredItems.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-dark-card rounded-3xl border border-border-soft dark:border-dark-border shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-brand-sage/40 dark:bg-dark-surface flex items-center justify-center text-3xl mx-auto mb-4">
            🖼️
          </div>
          <h2 className="text-xl font-extrabold text-brand-navy dark:text-dark-text-primary mb-2">No Photos Found</h2>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {selectedCategory === 'ALL'
              ? 'Our team is currently preparing new community and project photos. Check back soon!'
              : `No photos found in category "${selectedCategory}". Try selecting another category.`}
          </p>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white dark:text-brand-navy-dark bg-brand-green dark:bg-brand-cyan hover:bg-brand-green/90 dark:hover:bg-brand-cyan/90 transition-colors shadow-xs cursor-pointer"
            >
              Show All Photos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, index) => {
            const catStyle = getGalleryCategoryStyle(item.category)
            return (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openLightbox(index)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View photo: ${item.title || item.caption || 'Gallery photo'}`}
                className="group relative flex flex-col bg-white dark:bg-dark-card rounded-2xl border border-border-soft dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40 hover:shadow-card-hover overflow-hidden transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-green dark:focus:ring-brand-cyan"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/40 dark:bg-dark-surface">
                  <Image
                    src={item.imageUrl}
                    alt={item.altText || item.caption || item.title || 'Bridge of Compassion Gallery'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-4">
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      Click to expand
                    </span>
                  </div>

                  {/* Category Badge */}
                  {item.category && (
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-xs bg-white/95 dark:bg-dark-surface/95 ${catStyle.text} ${catStyle.border} shadow-2xs`}
                      >
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {item.featured && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-xs">
                        ★ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Footer */}
                {(item.title || item.caption) && (
                  <div className="p-4 flex flex-col flex-1 bg-white dark:bg-dark-card border-t border-border-soft/60 dark:border-dark-border">
                    {item.title && (
                      <h3 className="text-sm font-bold text-brand-navy dark:text-dark-text-primary group-hover:text-brand-green dark:group-hover:text-brand-cyan transition-colors line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                    )}
                    {item.caption && (
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
