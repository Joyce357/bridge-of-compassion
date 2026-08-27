// ─── Admin Dashboard Layout ──────────────────────────────────────────────────
// Wraps protected /admin/* routes with AdminSidebar, AdminTopbar, and SessionProvider.
// Public routes like /admin/login are outside the (dashboard) route group.

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SessionProvider from './SessionProvider'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

export const metadata = {
  title: { default: 'Admin — Bridge of Compassion', template: '%s | Admin' },
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <SessionProvider session={session}>
      <AdminLayoutClient
        userName={session.user?.name}
        userEmail={session.user?.email}
        userAvatar={session.user?.image}
      >
        {children}
      </AdminLayoutClient>
    </SessionProvider>
  )
}
