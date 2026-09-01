'use client'
// ─── Admin Site Settings Manager Component ──────────────────────────────────
// Manages organization profile, public contact, social links, donation defaults,
// and SEO defaults with live save feedback.

import { useState, FormEvent, ChangeEvent } from 'react'
import type { SiteSettingsRecord } from '@/types'

interface SiteSettingsManagerProps {
  initialSettings: SiteSettingsRecord
}

export default function SiteSettingsManager({ initialSettings }: SiteSettingsManagerProps) {
  // Form State
  const [formData, setFormData] = useState({
    organizationName:      initialSettings.organizationName || '',
    publicEmail:           initialSettings.publicEmail || '',
    phone:                 initialSettings.phone || '',
    addressLine1:          initialSettings.addressLine1 || '',
    addressLine2:          initialSettings.addressLine2 || '',
    city:                  initialSettings.city || '',
    province:              initialSettings.province || '',
    postalCode:            initialSettings.postalCode || '',
    country:               initialSettings.country || '',
    publicLocationLabel:   initialSettings.publicLocationLabel || '',

    facebookUrl:           initialSettings.facebookUrl || '',
    instagramUrl:          initialSettings.instagramUrl || '',
    linkedinUrl:           initialSettings.linkedinUrl || '',
    youtubeUrl:            initialSettings.youtubeUrl || '',

    footerTagline:         initialSettings.footerTagline || '',
    defaultCurrency:       initialSettings.defaultCurrency || 'CAD',
    presetAmountsStr:      (initialSettings.donationPresetAmounts || [25, 50, 100, 250, 500]).join(', '),

    seoTitle:              initialSettings.seoTitle || '',
    seoDescription:        initialSettings.seoDescription || '',
  })

  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)
    setFieldErrors({})
    setSaving(true)

    // Parse preset amounts
    const presets = formData.presetAmountsStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0)

    if (presets.length === 0) {
      setFieldErrors({ presetAmountsStr: 'Please provide at least one valid preset donation amount.' })
      setStatusMsg({ type: 'error', text: 'Please correct the highlighted fields below.' })
      setSaving(false)
      return
    }

    const payload = {
      organizationName:      formData.organizationName.trim(),
      publicEmail:           formData.publicEmail.trim(),
      phone:                 formData.phone.trim() || null,
      addressLine1:          formData.addressLine1.trim() || null,
      addressLine2:          formData.addressLine2.trim() || null,
      city:                  formData.city.trim() || null,
      province:              formData.province.trim() || null,
      postalCode:            formData.postalCode.trim() || null,
      country:               formData.country.trim() || null,
      publicLocationLabel:   formData.publicLocationLabel.trim() || null,

      facebookUrl:           formData.facebookUrl.trim() || null,
      instagramUrl:          formData.instagramUrl.trim() || null,
      linkedinUrl:           formData.linkedinUrl.trim() || null,
      youtubeUrl:            formData.youtubeUrl.trim() || null,

      footerTagline:         formData.footerTagline.trim() || null,
      defaultCurrency:       formData.defaultCurrency,
      donationPresetAmounts: presets,

      seoTitle:              formData.seoTitle.trim() || null,
      seoDescription:        formData.seoDescription.trim() || null,
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      setSaving(false)

      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields)
        }
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save settings.' })
      } else {
        setStatusMsg({ type: 'success', text: 'Global site settings saved and published successfully.' })
      }
    } catch {
      setSaving(false)
      setStatusMsg({ type: 'error', text: 'Network error while saving settings.' })
    }
  }

  const inputClass = (fieldName?: string) => `w-full px-4 py-2.5 border rounded-xl text-text-primary text-sm bg-white
    focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all shadow-2xs
    ${fieldName && fieldErrors[fieldName] ? 'border-red-400 bg-red-50/20' : 'border-border-soft'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status banner */}
      {statusMsg && (
        <div
          className={`text-sm px-5 py-3.5 rounded-xl font-medium border flex items-center justify-between animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. Organization Information ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs p-6 sm:p-7 space-y-5">
        <div className="border-b border-border-soft/60 pb-4">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <span>🏛️</span> Organization Profile
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Public organization branding displayed across navigation, footer, and receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={inputClass('organizationName')}
              required
            />
            {fieldErrors.organizationName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.organizationName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Public Location Display
            </label>
            <input
              type="text"
              name="publicLocationLabel"
              value={formData.publicLocationLabel}
              onChange={handleChange}
              placeholder="e.g. Toronto, Ontario"
              className={inputClass('publicLocationLabel')}
            />
            <p className="text-[11px] text-text-secondary mt-1">Displayed in public header/footer contact badges.</p>
          </div>
        </div>
      </div>

      {/* ── 2. Contact Information ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs p-6 sm:p-7 space-y-5">
        <div className="border-b border-border-soft/60 pb-4">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <span>📫</span> Public Contact Information
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Inquiry destinations and office mailing address.
          </p>
        </div>

        <div className="bg-brand-sky/20 border border-brand-cyan/20 rounded-xl p-3.5 text-xs text-brand-navy leading-relaxed">
          💡 <strong>Note on Email:</strong> The <em>Public Contact Email</em> below is where donor receipts and public contact inquiries are directed. It is managed independently from your admin account login email.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Public Contact / Reply Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="publicEmail"
              value={formData.publicEmail}
              onChange={handleChange}
              className={inputClass('publicEmail')}
              required
            />
            {fieldErrors.publicEmail && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.publicEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Public Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (416) 555-0199 (leave blank if pending)"
              className={inputClass('phone')}
            />
            <p className="text-[11px] text-text-secondary mt-1">Leave blank until officially confirmed by the client.</p>
          </div>
        </div>

        {/* Physical Address */}
        <div className="pt-2 border-t border-border-soft/60 space-y-4">
          <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider text-text-secondary">
            Mailing / Office Address (Optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address or P.O. Box"
                className={inputClass('addressLine1')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={inputClass('city')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Province / State</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={inputClass('province')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Postal / ZIP Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={inputClass('postalCode')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={inputClass('country')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Social Media Links ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs p-6 sm:p-7 space-y-5">
        <div className="border-b border-border-soft/60 pb-4">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <span>🌐</span> Social Media Accounts
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Links to official social channels. Leave blank to automatically hide that network from the public footer.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Facebook Page URL</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${formData.facebookUrl.trim() ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {formData.facebookUrl.trim() ? '✓ Active in Footer' : 'Hidden'}
              </span>
            </label>
            <input
              type="url"
              name="facebookUrl"
              value={formData.facebookUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/bridgeofcompassion"
              className={inputClass('facebookUrl')}
            />
            {fieldErrors.facebookUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.facebookUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Instagram Profile URL</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${formData.instagramUrl.trim() ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {formData.instagramUrl.trim() ? '✓ Active in Footer' : 'Hidden'}
              </span>
            </label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/bridgeofcompassion"
              className={inputClass('instagramUrl')}
            />
            {fieldErrors.instagramUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.instagramUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>LinkedIn Page URL</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${formData.linkedinUrl.trim() ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {formData.linkedinUrl.trim() ? '✓ Active in Footer' : 'Hidden'}
              </span>
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/bridgeofcompassion"
              className={inputClass('linkedinUrl')}
            />
            {fieldErrors.linkedinUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.linkedinUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>YouTube Channel URL</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${formData.youtubeUrl.trim() ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {formData.youtubeUrl.trim() ? '✓ Active in Footer' : 'Hidden'}
              </span>
            </label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/@bridgeofcompassion"
              className={inputClass('youtubeUrl')}
            />
            {fieldErrors.youtubeUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.youtubeUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Donation Defaults ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs p-6 sm:p-7 space-y-5">
        <div className="border-b border-border-soft/60 pb-4">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <span>🌱</span> Donation Defaults
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Default payment currency and quick-select donation amount buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Default Currency
            </label>
            <select
              name="defaultCurrency"
              value={formData.defaultCurrency}
              onChange={handleChange}
              className={inputClass('defaultCurrency')}
            >
              <option value="CAD">CAD — Canadian Dollar ($)</option>
              <option value="USD">USD — US Dollar ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Preset Amounts (Comma Separated)
            </label>
            <input
              type="text"
              name="presetAmountsStr"
              value={formData.presetAmountsStr}
              onChange={handleChange}
              placeholder="25, 50, 100, 250, 500"
              className={inputClass('presetAmountsStr')}
            />
            {fieldErrors.presetAmountsStr && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.presetAmountsStr}</p>
            )}
            <p className="text-[11px] text-text-secondary mt-1">Preset buttons presented on the public /donate form.</p>
          </div>
        </div>
      </div>

      {/* ── 5. SEO & Footer Defaults ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs p-6 sm:p-7 space-y-5">
        <div className="border-b border-border-soft/60 pb-4">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <span>🔍</span> SEO &amp; Brand Content Defaults
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Default site meta tags and global footer tagline.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Footer Brand Tagline
            </label>
            <textarea
              name="footerTagline"
              value={formData.footerTagline}
              onChange={handleChange}
              rows={2}
              className={inputClass('footerTagline')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Default SEO Title
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              className={inputClass('seoTitle')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Default SEO Description
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              rows={3}
              className={inputClass('seoDescription')}
            />
          </div>
        </div>
      </div>

      {/* Sticky / Floating Save Bar */}
      <div className="sticky bottom-4 z-20 bg-brand-navy-dark text-white rounded-2xl p-4 shadow-xl border border-white/10 flex items-center justify-between">
        <div className="text-xs text-brand-warm-white/80 hidden sm:block">
          Click below to save global site settings.
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving Changes…' : 'Save Site Settings'}
        </button>
      </div>
    </form>
  )
}
