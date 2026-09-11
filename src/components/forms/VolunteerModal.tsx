'use client'

import { useEffect, useRef } from 'react'
import VolunteerForm from './VolunteerForm'

interface VolunteerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VolunteerModal({ isOpen, onClose }: VolunteerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Manage body scroll locking and focus restoration
  useEffect(() => {
    if (isOpen) {
      // Store current active element to restore focus on close
      previousFocusRef.current = document.activeElement as HTMLElement | null

      // Lock body scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Focus modal container
      const timer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = originalOverflow
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        // Close if clicking directly on the backdrop container
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="volunteer-modal-title"
      aria-describedby="volunteer-modal-description"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-dark-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border-soft dark:border-dark-border max-w-2xl lg:max-w-3xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden outline-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-border-soft dark:border-dark-border bg-[#F9FAF7] dark:bg-dark-surface flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="eyebrow text-brand-green dark:text-brand-cyan text-[11px] sm:text-xs block mb-1">
              Get Involved
            </span>
            <h2
              id="volunteer-modal-title"
              className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight"
            >
              Become a Volunteer
            </h2>
            <p
              id="volunteer-modal-description"
              className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary mt-1 leading-relaxed max-w-xl"
            >
              Join our dedicated team of environmental stewards, mentors, and community advocates.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close volunteer modal"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-border-soft dark:border-dark-border bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-primary hover:text-brand-navy dark:hover:text-brand-cyan hover:bg-brand-cream/60 dark:hover:bg-dark-surface transition-all flex items-center justify-center text-sm font-semibold shrink-0 cursor-pointer shadow-xs focus:ring-2 focus:ring-brand-cyan focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 md:p-8 overflow-y-auto flex-1 overscroll-contain bg-white dark:bg-dark-card">
          <VolunteerForm isModal onClose={onClose} />
        </div>
      </div>
    </div>

  )
}
