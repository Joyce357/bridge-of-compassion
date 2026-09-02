'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

interface AdminLayoutClientProps {
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
  children: React.ReactNode
}

export default function AdminLayoutClient({ userName, userEmail, userAvatar, children }: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-brand-warm-white dark:bg-dark-bg">
      <AdminSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F2] dark:bg-dark-bg transition-colors duration-200">
        <AdminTopbar
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )

}
