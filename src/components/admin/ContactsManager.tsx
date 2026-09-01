'use client'

// ─── Admin Contacts Manager ────────────────────────────────────────────────
// Full interactive manager for contact inquiry submissions.

import { useState, useMemo, useEffect, useCallback } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { ContactSubmission, ContactCommunication } from '@/types'

interface ContactsManagerProps {
  initialSubmissions: ContactSubmission[]
}

type StatusFilter = 'ALL' | 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',      value: 'ALL'      },
  { label: 'New',      value: 'NEW'      },
  { label: 'Read',     value: 'READ'     },
  { label: 'Replied',  value: 'REPLIED'  },
  { label: 'Archived', value: 'ARCHIVED' },
]

function getDefaultReplySubject(subject: string | null | undefined): string {
  if (subject && subject.trim()) {
    return `Re: ${subject.trim()}`
  }
  return 'Re: Your Message to Bridge of Compassion'
}

export default function ContactsManager({ initialSubmissions }: ContactsManagerProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // Detail Modal
  const [selected, setSelected] = useState<ContactSubmission | null>(null)
  const [notesInput, setNotesInput] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Reply by Email State
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  // Status updating inline state
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Reset form state whenever a new submission is opened
  useEffect(() => {
    if (selected) {
      setNotesInput(selected.adminNotes || '')
      setReplySubject(getDefaultReplySubject(selected.subject))
      setReplyMessage('')
      setReplyError(null)
    }
  }, [selected])

  // ESC to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget) setDeleteTarget(null)
        else if (selected) setSelected(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, deleteTarget])

  // Status Counts
  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      ALL: submissions.length, NEW: 0, READ: 0, REPLIED: 0, ARCHIVED: 0,
    }
    for (const s of submissions) {
      if (s.status in map) map[s.status as StatusFilter]++
    }
    return map
  }, [submissions])

  // Filter & Search
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
      if (!matchesStatus) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q)
      )
    })
  }, [submissions, statusFilter, search])

  // Update Status
  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: ContactSubmission['status']) => {
      setUpdatingId(id)
      try {
        const res = await fetch(`/api/admin/contacts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update status')

        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
        )
        if (selected && selected.id === id) {
          setSelected((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
        showFeedback(`Status updated to ${newStatus}`)
      } catch (err: unknown) {
        showFeedback(err instanceof Error ? err.message : 'Error updating status', 'error')
      } finally {
        setUpdatingId(null)
      }
    },
    [selected],
  )

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/contacts/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notesInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save notes')

      setSubmissions((prev) =>
        prev.map((s) => (s.id === selected.id ? { ...s, adminNotes: notesInput } : s)),
      )
      setSelected((prev) => (prev ? { ...prev, adminNotes: notesInput } : null))
      showFeedback('Internal notes saved.')
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Error saving notes', 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  // Send Email Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    if (!replySubject.trim()) { setReplyError('Subject is required.'); return }
    if (!replyMessage.trim()) { setReplyError('Message body is required.'); return }

    setSendingReply(true)
    setReplyError(null)

    try {
      const res = await fetch(`/api/admin/contacts/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: replySubject.trim(),
          message: replyMessage.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send email reply.')

      const newComm: ContactCommunication = data.communication
      const updatedStatus: ContactSubmission['status'] = data.newStatus || selected.status

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? { ...s, status: updatedStatus, communications: [newComm, ...(s.communications || [])] }
            : s,
        ),
      )
      setSelected((prev) =>
        prev
          ? { ...prev, status: updatedStatus, communications: [newComm, ...(prev.communications || [])] }
          : null,
      )

      setReplyMessage('')
      setReplySubject(getDefaultReplySubject(selected.subject))
      showFeedback(`Reply sent to ${selected.email}`)
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send email reply')
    } finally {
      setSendingReply(false)
    }
  }

  // Delete Submission
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/contacts/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete submission')

      setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      if (selected && selected.id === deleteTarget.id) setSelected(null)
      setDeleteTarget(null)
      showFeedback('Contact submission deleted.')
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Error deleting submission', 'error')
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
            Contact Inquiries
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Review, reply to, and manage incoming contact messages ({submissions.length} total)
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-brand-warm-white rounded-2xl p-4 sm:p-5 shadow-card border border-border-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, subject…"
              aria-label="Search contact submissions"
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

          <div className="text-xs text-text-secondary flex items-center gap-2 self-end md:self-center">
            <span>Showing <strong className="text-brand-navy">{filtered.length}</strong> of {submissions.length}</span>
          </div>
        </div>

        {/* Status Tabs */}
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
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
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

      {/* Submissions Table */}
      <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon="✉️"
              title={
                submissions.length === 0
                  ? 'No contact inquiries yet'
                  : 'No matching inquiries found'
              }
              message={
                submissions.length === 0
                  ? 'When visitors submit the contact form, their messages will appear here.'
                  : 'Try clearing your search or adjusting your status filter.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                <tr>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Subject & Preview</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-cream/30 transition-colors group">
                    {/* Sender */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-brand-navy">{s.name}</div>
                      <a
                        href={`mailto:${s.email}`}
                        className="text-xs text-text-secondary hover:text-brand-green truncate block max-w-[180px]"
                        title={s.email}
                      >
                        {s.email}
                      </a>
                      {s.communications && s.communications.length > 0 && (
                        <div className="text-[11px] text-brand-green bg-brand-green/10 border border-brand-green/20 rounded px-1.5 py-0.5 inline-flex items-center gap-1 mt-1">
                          <span>✉️</span> {s.communications.length} {s.communications.length === 1 ? 'reply' : 'replies'}
                        </div>
                      )}
                    </td>

                    {/* Subject & Preview */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-brand-navy truncate">{s.subject}</div>
                      <div className="text-xs text-text-secondary/80 truncate mt-0.5 max-w-[240px]">
                        {s.message}
                      </div>
                      {s.adminNotes && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 inline-flex items-center gap-1 mt-1 max-w-[200px] truncate">
                          <span>📝</span> {s.adminNotes}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} />
                        {updatingId === s.id && (
                          <span className="text-xs text-text-secondary animate-pulse">…</span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString('en-CA', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(s)}
                          className="px-3 py-1.5 rounded-lg bg-brand-sky text-brand-navy hover:bg-brand-sky/80 text-xs font-semibold transition-all border border-brand-cyan/20 cursor-pointer"
                        >
                          View & Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-all text-xs cursor-pointer"
                          title="Delete submission"
                          aria-label={`Delete submission from ${s.name}`}
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

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-detail-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-border-soft max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between bg-[#F8FAF6]">
              <div>
                <h2 id="contact-detail-title" className="text-lg font-bold text-brand-navy">
                  Inquiry Details
                </h2>
                <p className="text-xs text-text-secondary">
                  Submitted on{' '}
                  {new Date(selected.createdAt).toLocaleDateString('en-CA', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg border border-border-soft flex items-center justify-center text-text-secondary hover:text-brand-navy hover:bg-white transition-all cursor-pointer"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Sender Info & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-cream/30 p-4 rounded-xl border border-border-soft/70">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Sender
                  </label>
                  <p className="font-bold text-brand-navy text-base">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-xs text-brand-green hover:underline break-all"
                  >
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      <a href={`tel:${selected.phone}`} className="hover:text-brand-navy">
                        {selected.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        handleUpdateStatus(selected.id, e.target.value as ContactSubmission['status'])
                      }
                      className="bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-navy focus:ring-2 focus:ring-brand-cyan focus:outline-none cursor-pointer"
                    >
                      <option value="NEW">New</option>
                      <option value="READ">Read</option>
                      <option value="REPLIED">Replied</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-[11px] text-text-secondary/70 mt-1.5">
                    Archive = close · Set to Read to reopen
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Subject
                </h3>
                <p className="font-semibold text-brand-navy">{selected.subject}</p>
              </div>

              {/* Original Message */}
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Original Message
                </h3>
                <div className="p-4 bg-brand-warm-white/70 border border-border-soft rounded-xl text-text-primary whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>
              </div>

              {/* ─── Communication History ─────────────────────────────── */}
              <div className="border-t border-border-soft pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                    <span>📬</span> Reply History ({selected.communications?.length || 0})
                  </h3>
                </div>

                {selected.communications && selected.communications.length > 0 ? (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {selected.communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="bg-brand-warm-white border border-border-soft rounded-xl p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-border-soft/60 pb-2">
                          <span className="font-bold text-brand-navy truncate">{comm.subject}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-brand-green border border-brand-green/20">
                            Sent
                          </span>
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                          {comm.message}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                          <span>To: <strong className="text-brand-navy">{comm.recipientEmail}</strong></span>
                          <span>
                            {new Date(comm.sentAt).toLocaleDateString('en-CA', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {comm.sentByName && (
                          <div className="text-[11px] text-text-secondary/70">
                            Sent by: {comm.sentByName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-border-soft/60 rounded-xl text-center text-xs text-text-secondary">
                    No email replies sent to this contact yet.
                  </div>
                )}
              </div>

              {/* ─── Reply by Email ───────────────────────────────────── */}
              <div className="border-t border-border-soft pt-4 space-y-3">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                  <span>✉️</span> Reply by Email
                </h3>

                <form onSubmit={handleSendReply} className="space-y-3">
                  {replyError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl">
                      {replyError}
                    </div>
                  )}

                  {/* To (Read-only) */}
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">
                      To <span className="text-[11px] text-text-secondary/70">(Contact Email — from record)</span>
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={selected.email}
                      className="w-full bg-gray-100/80 border border-border-soft rounded-xl px-3.5 py-2 text-xs text-text-secondary cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="contact-reply-subject" className="text-xs text-brand-navy font-semibold block mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-reply-subject"
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      placeholder="Subject line"
                      required
                      className="w-full bg-white border border-border-soft rounded-xl px-3.5 py-2 text-xs text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-reply-message" className="text-xs text-brand-navy font-semibold block mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-reply-message"
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Write your response to the inquiry…"
                      required
                      className="w-full bg-white border border-border-soft rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-brand-cyan focus:outline-none resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-text-secondary">
                      ℹ️ Replies update status to <strong className="text-brand-navy">Replied</strong> automatically.
                    </p>
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-4 py-2 rounded-xl bg-brand-green text-brand-warm-white text-xs font-semibold hover:bg-brand-green/90 transition-all disabled:opacity-60 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {sendingReply ? (
                        <>
                          <span className="animate-spin text-xs">⏳</span>
                          <span>Sending Email…</span>
                        </>
                      ) : (
                        <>
                          <span>Send Email Reply</span>
                          <span>↗</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* ─── Internal Admin Notes ─────────────────────────────── */}
              <div className="border-t border-border-soft pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="contact-admin-notes"
                    className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>📝</span> Internal Admin Notes
                  </label>
                  <span className="text-[11px] text-text-secondary italic">(Not visible to sender)</span>
                </div>
                <textarea
                  id="contact-admin-notes"
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record follow-up actions, context, escalation notes…"
                  className="w-full bg-white border border-border-soft rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-3.5 py-1.5 rounded-xl border border-border-soft bg-white text-brand-navy text-xs font-semibold hover:bg-gray-50 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {savingNotes ? 'Saving…' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border-soft bg-gray-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selected)
                  setSelected(null)
                }}
                className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Delete Submission
              </button>

              <button
                type="button"
                onClick={() => setSelected(null)}
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
          aria-labelledby="contact-delete-confirm-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border-soft space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center">
              <h3 id="contact-delete-confirm-title" className="text-lg font-bold text-brand-navy">
                Delete Contact Submission?
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to permanently delete the submission from{' '}
                <strong className="text-brand-navy">{deleteTarget.name}</strong>? This will also
                delete all reply history. This action cannot be undone.
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
