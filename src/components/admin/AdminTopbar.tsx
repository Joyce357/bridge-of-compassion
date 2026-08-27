'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface AdminTopbarProps {
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
  onToggleMobileSidebar?: () => void
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/programs': 'Programs',
  '/admin/events': 'Events',
  '/admin/news': 'News & Stories',
  '/admin/gallery': 'Gallery',
  '/admin/volunteers': 'Volunteers',
  '/admin/donations': 'Donations',
  '/admin/contacts': 'Contacts',
  '/admin/newsletter': 'Newsletter',
  '/admin/settings': 'Settings',
}

export default function AdminTopbar({ userName, userEmail, userAvatar, onToggleMobileSidebar }: AdminTopbarProps) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  // Derive title from pathname
  let pageTitle = 'Admin'
  for (const [route, label] of Object.entries(pageTitles)) {
    if (route === '/admin' ? pathname === '/admin' : pathname.startsWith(route)) {
      pageTitle = label
      break
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/admin/login' })
  }

  const initial = (userName ?? userEmail ?? 'A')[0].toUpperCase()

  return (
    <header className="h-14 sm:h-16 bg-[#FCFBF6] border-b border-[#DDE3DA] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
      {/* Left: Mobile Trigger + Page Title / Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-brand-navy hover:bg-brand-cream/80 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2 text-brand-navy font-bold text-base sm:text-lg">
          <span className="text-text-secondary text-xs sm:text-sm font-medium hidden md:inline">Admin /</span>
          <h1 className="tracking-tight text-brand-navy font-extrabold">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* View Website Action */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-green bg-brand-green/10 hover:bg-brand-green/20 transition-colors border border-brand-green/20"
        >
          <span>View Website</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        {/* User Identity */}
        <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-white border border-[#DDE3DA]">
          {userAvatar ? (
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#DDE3DA]">
              <Image src={userAvatar} alt={userName ?? 'Admin'} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-cyan font-bold text-xs flex items-center justify-center shrink-0">
              {initial}
            </div>
          )}
          <div className="text-left max-w-[140px] truncate">
            <p className="text-xs font-bold text-brand-navy leading-tight truncate">
              {userName ?? userEmail ?? 'Admin'}
            </p>
            {userName && userEmail && (
              <p className="text-[10px] text-text-secondary truncate leading-tight">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 transition-colors border border-red-200 disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </header>
  )
}
