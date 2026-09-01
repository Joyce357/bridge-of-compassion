// ─── Admin: Settings Page (Server Component) ────────────────────────────────
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'
import SettingsView from '@/components/admin/SettingsView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const settings = await getSiteSettings()

  return <SettingsView initialSettings={settings} />
}
