'use client'
// ─── Settings View Container ────────────────────────────────────────────────
// Provides tabbed navigation between Global Site Settings and Admin Account Profile/Security.

import { useState } from 'react'
import SiteSettingsManager from '@/components/admin/SiteSettingsManager'
import AdminAccountManager from '@/components/admin/AdminAccountManager'
import type { SiteSettingsRecord } from '@/types'

interface SettingsViewProps {
  initialSettings: SiteSettingsRecord
}

export default function SettingsView({ initialSettings }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'site' | 'account'>('site')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Settings
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Global organization configuration, public contact details, social links, and account security.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'site'
              ? 'bg-brand-navy text-brand-warm-white shadow-xs'
              : 'text-text-secondary hover:text-brand-navy hover:bg-brand-cream/50'
          }`}
        >
          <span>🌐</span> Site &amp; Organization
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'account'
              ? 'bg-brand-navy text-brand-warm-white shadow-xs'
              : 'text-text-secondary hover:text-brand-navy hover:bg-brand-cream/50'
          }`}
        >
          <span>👤</span> Account &amp; Security
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'site' ? (
          <SiteSettingsManager initialSettings={initialSettings} />
        ) : (
          <AdminAccountManager />
        )}
      </div>
    </div>
  )
}
