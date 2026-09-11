'use client'
// ─── Admin Account & Security Component ──────────────────────────────────────
// Handles admin user profile photo, name, login email, and password changes.

import { useState, useRef, FormEvent, ChangeEvent } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function AdminAccountManager() {
  const { data: session, update } = useSession()

  // Profile form
  const [name, setName] = useState(session?.user?.name ?? '')
  const [email, setEmail] = useState(session?.user?.email ?? '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [removingAvatar, setRemovingAvatar] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savingPw, setSavingPw] = useState(false)

  const currentAvatar = previewUrl || session?.user?.image || null
  const initial = (session?.user?.name ?? session?.user?.email ?? 'A')[0].toUpperCase()
  const role = session?.user?.role ?? 'ADMIN'

  // Handle file selection and immediate upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarMsg(null)

    // Validate type client-side
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setAvatarMsg({ type: 'error', text: 'Invalid file format. Please choose a JPEG, PNG, or WebP image.' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate size client-side (max 3 MB)
    if (file.size > 3 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Image exceeds 3 MB limit. Please select a smaller photo.' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Show temporary local preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setAvatarMsg({ type: 'error', text: data.error ?? 'Upload failed.' })
        setPreviewUrl(null)
      } else {
        setAvatarMsg({ type: 'success', text: 'Profile picture updated successfully.' })
        setPreviewUrl(data.avatarUrl)
        // Refresh NextAuth session
        await update({ image: data.avatarUrl })
      }
    } catch {
      setAvatarMsg({ type: 'error', text: 'Network error while uploading photo.' })
      setPreviewUrl(null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    if (!session?.user?.image && !previewUrl) return
    if (!confirm('Are you sure you want to remove your profile photo?')) return

    setAvatarMsg(null)
    setRemovingAvatar(true)

    try {
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        setAvatarMsg({ type: 'error', text: data.error ?? 'Failed to remove photo.' })
      } else {
        setPreviewUrl(null)
        setAvatarMsg({ type: 'success', text: 'Profile photo removed.' })
        // Refresh NextAuth session
        await update({ image: null })
      }
    } catch {
      setAvatarMsg({ type: 'error', text: 'Network error while removing photo.' })
    } finally {
      setRemovingAvatar(false)
    }
  }

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)
    setSavingProfile(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, isProfileUpdate: true }),
      })
      const data = await res.json()
      setSavingProfile(false)

      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error ?? 'Failed to update profile.' })
      } else {
        await update({ name: data.user.name, email: data.user.email })
        setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
      }
    } catch {
      setSavingProfile(false)
      setProfileMsg({ type: 'error', text: 'Network error while saving profile.' })
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPw !== confirmPw) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    setSavingPw(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
      })
      const data = await res.json()
      setSavingPw(false)

      if (!res.ok) {
        setPasswordMsg({ type: 'error', text: data.error ?? 'Failed to update password.' })
      } else {
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      }
    } catch {
      setSavingPw(false)
      setPasswordMsg({ type: 'error', text: 'Network error while updating password.' })
    }
  }

  const inputClass = `w-full px-4 py-2.5 border border-border-soft dark:border-dark-border rounded-xl text-text-primary dark:text-dark-text-primary text-sm
    bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-green/40 dark:focus:ring-brand-cyan/40 focus:border-brand-green dark:focus:border-brand-cyan transition-all shadow-2xs`

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Admin Profile & Avatar ── */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border-soft dark:border-dark-border shadow-xs p-6 sm:p-7 transition-colors duration-200">
        <div className="flex items-center justify-between border-b border-border-soft/60 dark:border-dark-border pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-brand-navy dark:text-dark-text-primary">Admin Profile</h2>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Profile photo and basic account credentials</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-navy/10 dark:bg-brand-cyan/10 text-brand-navy dark:text-brand-cyan border border-brand-navy/20 dark:border-brand-cyan/20">
            {role}
          </span>
        </div>

        {/* Avatar message banner */}
        {avatarMsg && (
          <div
            className={`text-sm px-4 py-3 rounded-xl mb-6 font-medium ${
              avatarMsg.type === 'success'
                ? 'bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800 text-green-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {avatarMsg.text}
          </div>
        )}

        {/* Profile Picture Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-brand-cream/50 dark:bg-dark-surface border border-border-soft/80 dark:border-dark-border mb-6">
          {/* Avatar Preview */}
          <div className="relative shrink-0">
            {currentAvatar ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-brand-green/30 dark:border-brand-cyan/30 shadow-xs bg-white dark:bg-dark-surface">
                <Image
                  src={currentAvatar}
                  alt={session?.user?.name ?? 'Admin Avatar'}
                  fill
                  className="object-cover"
                  unoptimized={currentAvatar.startsWith('blob:')}
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-navy dark:bg-dark-surface text-brand-cyan text-2xl sm:text-3xl font-extrabold flex items-center justify-center border-2 border-brand-cyan/40 shadow-xs">
                {initial}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Avatar Controls */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className="text-sm font-bold text-brand-navy dark:text-dark-text-primary">Profile Photo</h3>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              JPEG, PNG, or WebP. Max 3 MB. Stored securely on Cloudinary.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || removingAvatar}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white dark:text-brand-navy-dark bg-brand-navy dark:bg-brand-cyan hover:bg-brand-navy-dark dark:hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {uploadingAvatar ? 'Uploading…' : currentAvatar ? 'Change Photo' : 'Upload Photo'}
              </button>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || removingAvatar}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {removingAvatar ? 'Removing…' : 'Remove Photo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          {profileMsg && (
            <div
              className={`text-sm px-4 py-3 rounded-xl font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800 text-green-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {profileMsg.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              Login Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white dark:text-brand-navy-dark bg-brand-green dark:bg-brand-cyan hover:bg-brand-green/90 dark:hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {savingProfile ? 'Saving Changes…' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border-soft dark:border-dark-border shadow-xs p-6 sm:p-7 transition-colors duration-200">
        <div className="border-b border-border-soft/60 dark:border-dark-border pb-4 mb-6">
          <h2 className="text-lg font-bold text-brand-navy dark:text-dark-text-primary">Change Password</h2>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Ensure your account uses a strong, unique password</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordMsg && (
            <div
              className={`text-sm px-4 py-3 rounded-xl font-medium ${
                passwordMsg.type === 'success'
                  ? 'bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800 text-green-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
            <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary mt-1 font-medium">Minimum 10 characters.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-navy dark:text-dark-text-primary uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPw}
              className="px-4 py-2 rounded-xl text-xs font-bold text-brand-navy dark:text-dark-text-primary bg-brand-cream dark:bg-dark-surface hover:bg-brand-cream/80 dark:hover:bg-dark-card border border-border-soft dark:border-dark-border transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {savingPw ? 'Updating Password…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
