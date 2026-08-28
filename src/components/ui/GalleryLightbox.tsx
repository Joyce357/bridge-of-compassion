// ─── Accessible Gallery Lightbox ──────────────────────────────────────────
'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types'
import { getGalleryCategoryStyle } from '@/lib/validations'

interface GalleryLightboxProps {
  items: GalleryItem[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function GalleryLightbox({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const currentItem = items[currentIndex]

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return
    onNavigate((currentIndex - 1 + items.length) % items.length)
  }, [currentIndex, items.length, onNavigate])

  const handleNext = useCallback(() => {
    if (items.length <= 1) return
    onNavigate((currentIndex + 1) % items.length)
  }, [currentIndex, items.length, onNavigate])

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, handlePrev, handleNext])

  if (!isOpen || !currentItem) return null

  const catStyle = getGalleryCategoryStyle(currentItem.category)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || currentItem.caption || 'Gallery Photo Preview'}
      onClick={onClose}
    >
      {/* Container to prevent backdrop click closing when clicking dialog content */}
      <div
        className="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[95vh] focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between text-white/80 pb-3 text-xs sm:text-sm font-medium z-10">
          <div className="flex items-center gap-2">
            {currentItem.category && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-xs bg-white/10 ${catStyle.text} ${catStyle.border}`}
              >
                {currentItem.category}
              </span>
            )}
            <span className="text-white/60 font-mono">
              {currentIndex + 1} of {items.length}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close lightbox"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-green/60"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Photo Display */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[70vh] bg-black/40 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          <Image
            src={currentItem.imageUrl}
            alt={currentItem.altText || currentItem.caption || currentItem.title || 'Bridge of Compassion Gallery Photo'}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="object-contain"
          />

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-green border border-white/10 shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-green border border-white/10 shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Caption & Details Footer */}
        {(currentItem.title || currentItem.caption) && (
          <div className="w-full text-center pt-3 px-4 max-w-2xl text-white">
            {currentItem.title && (
              <h3 className="text-base sm:text-lg font-bold tracking-tight mb-1 text-white">
                {currentItem.title}
              </h3>
            )}
            {currentItem.caption && (
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {currentItem.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
