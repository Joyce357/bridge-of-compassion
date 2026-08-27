'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/admin',          label: 'Dashboard',   icon: '📊' },
    ],
  },
  {
    label: 'Submissions',
    items: [
      { href: '/admin/contacts',   label: 'Contacts',   icon: '✉️' },
      { href: '/admin/volunteers', label: 'Volunteers',  icon: '🤝' },
      { href: '/admin/newsletter', label: 'Newsletter',  icon: '📬' },
      { href: '/admin/donations',  label: 'Donations',   icon: '🌱' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/programs', label: 'Programs', icon: '🌿' },
      { href: '/admin/events',   label: 'Events',   icon: '📅' },
      { href: '/admin/news',     label: 'News',     icon: '📰' },
      { href: '/admin/gallery',  label: 'Gallery',  icon: '🖼️' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
]

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export default function AdminSidebar({ userName, userEmail, userAvatar, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/admin/login' })
  }

  const renderSidebarContent = (isMobile = false) => (
    <aside className="w-64 h-full min-h-screen bg-brand-navy-dark flex flex-col border-r border-brand-navy shrink-0">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link
          href="/admin"
          className="block focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-lg"
          onClick={isMobile ? onCloseMobile : undefined}
        >
          <div className="relative w-44 h-12 bg-white/95 rounded-xl p-1.5 shadow-sm mb-1.5">
            <Image
              src="/images/bridgeofcompassion-logo.png"
              alt="Bridge of Compassion"
              fill
              className="object-contain p-0.5"
              sizes="180px"
            />
          </div>
          <span className="block text-brand-cyan text-[11px] font-semibold tracking-wider uppercase px-1">Admin Portal</span>
        </Link>
        {isMobile && onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1 text-white/70 hover:text-white rounded-lg text-sm">
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin navigation">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-1.5 text-[10px] font-bold text-brand-sky/60 tracking-widest uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={isMobile ? onCloseMobile : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive(item.href)
                        ? 'bg-brand-cyan/20 text-brand-warm-white font-semibold border-l-2 border-brand-cyan shadow-sm'
                        : 'text-brand-warm-white/75 hover:bg-brand-navy hover:text-brand-warm-white'
                    }`}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          {userAvatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-brand-cyan/30">
              <Image src={userAvatar} alt={userName ?? 'Admin'} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-brand-cyan font-bold text-sm shrink-0 border border-brand-cyan/30">
              {(userName ?? userEmail ?? 'A')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-brand-warm-white text-sm font-medium truncate">
              {userName ?? 'Admin'}
            </p>
            <p className="text-brand-warm-white/60 text-xs truncate">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Link
            href="/"
            className="flex-1 text-center px-3 py-1.5 rounded-lg text-xs text-brand-sky/80 hover:text-brand-warm-white hover:bg-brand-navy transition-colors"
          >
            View Site ↗
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs text-brand-sky/80 hover:text-brand-warm-white hover:bg-brand-navy transition-colors disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop Sidebar (persistent) */}
      <div className="hidden lg:block shrink-0">
        {renderSidebarContent(false)}
      </div>

      {/* Mobile Drawer (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  )
}
