'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { VolunteerApplication } from '@/types'

interface VolunteersManagerProps {
  initialApplications: VolunteerApplication[]
}

type StatusFilter = 'ALL' | 'NEW' | 'REVIEWING' | 'CONTACTED' | 'ACTIVE' | 'INACTIVE'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'New / Pending', value: 'NEW' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

export default function VolunteersManager({
  initialApplications,
}: VolunteersManagerProps) {
  const [applications, setApplications] = useState<VolunteerApplication[]>(initialApplications)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState<VolunteerApplication | null>(null)
  const [notesInput, setNotesInput] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Status updating inline state
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<VolunteerApplication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Sync selectedApp notesInput whenever selectedApp changes
  useEffect(() => {
    if (selectedApp) {
      setNotesInput(selectedApp.adminNotes || '')
    }
  }, [selectedApp])

  // Handle keyboard ESC to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget) setDeleteTarget(null)
        else if (selectedApp) setSelectedApp(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedApp, deleteTarget])

  // Status Counts
  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      ALL: applications.length,
      NEW: 0,
      REVIEWING: 0,
      CONTACTED: 0,
      ACTIVE: 0,
      INACTIVE: 0,
    }
    for (const app of applications) {
      if (app.status in map) {
        map[app.status as StatusFilter]++
      }
    }
    return map
  }, [applications])

  // Filter & Search
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
      if (!matchesStatus) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      const fullName = `${app.firstName} ${app.lastName}`.toLowerCase()
      const email = (app.email || '').toLowerCase()
      const phone = (app.phone || '').toLowerCase()
      const location = (app.location || '').toLowerCase()
      const interests = (app.interests || []).join(' ').toLowerCase()

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        location.includes(q) ||
        interests.includes(q)
      )
    })
  }, [applications, statusFilter, search])

  // Update Status
  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: VolunteerApplication['status']) => {
      setUpdatingId(id)
      try {
        const res = await fetch(`/api/admin/volunteers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update status')
        }

        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
        )

        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null))
        }

        showFeedback(`Status updated to ${newStatus}`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error updating status'
        showFeedback(msg, 'error')
      } finally {
        setUpdatingId(null)
      }
    },
    [selectedApp],
  )

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/volunteers/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notesInput }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save admin notes')
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, adminNotes: notesInput } : app,
        ),
      )
      setSelectedApp((prev) => (prev ? { ...prev, adminNotes: notesInput } : null))
      showFeedback('Internal admin notes saved successfully.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving notes'
      showFeedback(msg, 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  // Delete Application
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/volunteers/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete application')
      }

      setApplications((prev) => prev.filter((app) => app.id !== deleteTarget.id))
      if (selectedApp && selectedApp.id === deleteTarget.id) {
        setSelectedApp(null)
      }
      setDeleteTarget(null)
      showFeedback('Volunteer application deleted.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting application'
      showFeedback(msg, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-brand-navy text-brand-warm-white border border-brand-cyan/30'
              : 'bg-red-600 text-white'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-soft">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Volunteer Applications
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Review, contact, and manage community volunteers ({applications.length} total)
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Status Tabs */}
      <div className="bg-brand-warm-white rounded-2xl p-4 sm:p-5 shadow-card border border-border-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, phone, skills…"
              aria-label="Search volunteer applications"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border-soft rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-text-secondary hover:text-brand-navy"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export / Count Summary */}
          <div className="text-xs text-text-secondary flex items-center gap-2 self-end md:self-center">
            <span>Showing <strong className="text-brand-navy">{filteredApplications.length}</strong> of {applications.length} applications</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-medium border-t border-border-soft/60 pt-3">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab.value]
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  active
                    ? 'bg-brand-green text-brand-warm-white font-semibold shadow-xs'
                    : 'bg-brand-cream/50 text-text-secondary hover:bg-brand-cream hover:text-brand-navy'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-black/5 text-text-secondary'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Applications List / Table */}
      <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon="🤝"
              title={
                applications.length === 0
                  ? 'No volunteer applications yet'
                  : 'No matching applications found'
              }
              message={
                applications.length === 0
                  ? 'When community members submit the volunteer form, their applications will appear here.'
                  : 'Try clearing your search or adjusting your status filter.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                <tr>
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Interests &amp; Availability</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-brand-cream/30 transition-colors group"
                  >
                    {/* Name & Location */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-brand-navy">
                        {app.firstName} {app.lastName}
                      </div>
                      {app.location && (
                        <div className="text-xs text-text-secondary/80 flex items-center gap-1 mt-0.5">
                          <span>📍</span> {app.location}
                        </div>
                      )}
                      {app.adminNotes && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 inline-flex items-center gap-1 mt-1 max-w-[200px] truncate">
                          <span>📝</span> {app.adminNotes}
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${app.email}`}
                        className="text-xs font-medium text-brand-navy hover:text-brand-green block truncate max-w-[200px]"
                        title={app.email}
                      >
                        {app.email}
                      </a>
                      {app.phone && (
                        <a
                          href={`tel:${app.phone}`}
                          className="text-xs text-text-secondary hover:text-brand-navy block mt-0.5"
                        >
                          {app.phone}
                        </a>
                      )}
                    </td>

                    {/* Interests & Availability */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {app.interests && app.interests.length > 0 ? (
                          app.interests.slice(0, 2).map((interest) => (
                            <span
                              key={interest}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-brand-sky/40 text-brand-navy border border-brand-cyan/20 truncate"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-secondary/70">General</span>
                        )}
                        {app.interests && app.interests.length > 2 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 text-text-secondary">
                            +{app.interests.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary">
                        ⏱️ {app.availability || 'Flexible'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                        {updatingId === app.id && (
                          <span className="text-xs text-text-secondary animate-pulse">…</span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-brand-sky text-brand-navy hover:bg-brand-sky/80 text-xs font-semibold transition-all border border-brand-cyan/20 cursor-pointer"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-all text-xs cursor-pointer"
                          title="Delete application"
                          aria-label={`Delete application from ${app.firstName} ${app.lastName}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="volunteer-detail-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-border-soft max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between bg-[#F8FAF6]">
              <div>
                <h2 id="volunteer-detail-title" className="text-lg font-bold text-brand-navy">
                  Application Details
                </h2>
                <p className="text-xs text-text-secondary">
                  Submitted on{' '}
                  {new Date(selectedApp.createdAt).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-lg border border-border-soft flex items-center justify-center text-text-secondary hover:text-brand-navy hover:bg-white transition-all cursor-pointer"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Applicant Info & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-cream/30 p-4 rounded-xl border border-border-soft/70">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Applicant Name
                  </label>
                  <p className="font-bold text-brand-navy text-base">
                    {selectedApp.firstName} {selectedApp.lastName}
                  </p>
                  {selectedApp.location && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      📍 {selectedApp.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Application Status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedApp.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedApp.id,
                          e.target.value as VolunteerApplication['status'],
                        )
                      }
                      className="bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-navy focus:ring-2 focus:ring-brand-cyan focus:outline-none cursor-pointer"
                    >
                      <option value="NEW">New / Pending</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-border-soft rounded-xl">
                    <span className="text-xs text-text-secondary block">Email</span>
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="font-medium text-brand-green hover:underline break-all"
                    >
                      {selectedApp.email}
                    </a>
                  </div>
                  <div className="p-3 bg-white border border-border-soft rounded-xl">
                    <span className="text-xs text-text-secondary block">Phone</span>
                    {selectedApp.phone ? (
                      <a
                        href={`tel:${selectedApp.phone}`}
                        className="font-medium text-brand-navy hover:underline"
                      >
                        {selectedApp.phone}
                      </a>
                    ) : (
                      <span className="text-text-secondary/60 text-xs italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Volunteer Preferences */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Volunteer Preferences
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white border border-border-soft rounded-xl">
                    <span className="text-xs text-text-secondary block mb-1.5">
                      Areas of Interest
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.interests && selectedApp.interests.length > 0 ? (
                        selectedApp.interests.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 rounded-md bg-brand-sky/40 text-brand-navy font-medium text-xs border border-brand-cyan/20"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-secondary">General Interest</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-border-soft rounded-xl">
                    <span className="text-xs text-text-secondary block mb-1">Availability</span>
                    <p className="font-medium text-brand-navy">{selectedApp.availability}</p>
                  </div>
                </div>
              </div>

              {/* Message from Applicant */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Applicant Statement / Message
                </h3>
                <div className="p-4 bg-brand-warm-white/70 border border-border-soft rounded-xl text-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedApp.message ? (
                    selectedApp.message
                  ) : (
                    <span className="text-text-secondary/60 italic text-xs">
                      No additional message provided.
                    </span>
                  )}
                </div>
              </div>

              {/* Consent & Verification */}
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="text-brand-green font-bold">✓</span>
                <span>Applicant consented to information storage and contact policy.</span>
              </div>

              {/* Internal Admin Notes */}
              <div className="border-t border-border-soft pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="admin-notes" className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝</span> Internal Admin Notes
                  </label>
                  <span className="text-[11px] text-text-secondary italic">
                    (Not visible to applicant)
                  </span>
                </div>
                <textarea
                  id="admin-notes"
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record review notes, interview feedback, schedule details, or follow-up tasks…"
                  className="w-full bg-white border border-border-soft rounded-xl p-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 rounded-xl bg-brand-green text-brand-warm-white text-xs font-semibold hover:bg-brand-green/90 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {savingNotes ? 'Saving Notes…' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border-soft bg-gray-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedApp)
                  setSelectedApp(null)
                }}
                className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Delete Application
              </button>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-border-soft bg-white text-brand-navy font-semibold text-xs hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border-soft space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center">
              <h3 id="delete-confirm-title" className="text-lg font-bold text-brand-navy">
                Delete Volunteer Application?
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to permanently delete the application from{' '}
                <strong className="text-brand-navy">
                  {deleteTarget.firstName} {deleteTarget.lastName}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-border-soft font-semibold text-xs text-text-secondary hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
