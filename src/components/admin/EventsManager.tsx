'use client'

import { useState } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import type { Event } from '@/types'

interface EventsManagerProps {
  initialEvents: Event[]
  totalCount: number
}

interface FormState {
  id?: string
  title: string
  category: string
  shortDescription: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  registrationLink: string
  registrationOpen: boolean
  featured: boolean
  published: boolean
}

const EVENT_CATEGORIES = [
  'Environmental',
  'Volunteer',
  'Fundraiser',
  'Youth',
  'Community',
  'Workshop',
  'Education',
]

const emptyForm: FormState = {
  title: '',
  category: 'Environmental',
  shortDescription: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00 AM',
  endTime: '01:00 PM',
  location: '',
  registrationLink: '',
  registrationOpen: true,
  featured: false,
  published: false,
}

export default function EventsManager({
  initialEvents,
  totalCount,
}: EventsManagerProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [total, setTotal] = useState(totalCount)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false)
    setFormData(emptyForm)
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (event: Event) => {
    setIsEditing(true)
    const formattedDate = event.date
      ? new Date(event.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    setFormData({
      id: event.id,
      title: event.title,
      category: event.category || 'Environmental',
      shortDescription: event.shortDescription || '',
      description: event.description,
      date: formattedDate,
      startTime: event.startTime || '09:00 AM',
      endTime: event.endTime || '',
      location: event.location,
      registrationLink: event.registrationLink || '',
      registrationOpen: event.registrationOpen ?? true,
      featured: event.featured ?? false,
      published: event.published ?? false,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Full description is required'
    if (!formData.date) errors.date = 'Event date is required'
    if (!formData.startTime.trim()) errors.startTime = 'Start time is required'
    if (!formData.location.trim()) errors.location = 'Location is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit Handler (Create & Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        shortDescription: formData.shortDescription.trim() || null,
        description: formData.description.trim(),
        date: formData.date,
        startTime: formData.startTime.trim(),
        endTime: formData.endTime.trim() || null,
        location: formData.location.trim(),
        registrationLink: formData.registrationLink.trim() || null,
        registrationOpen: formData.registrationOpen,
        featured: formData.featured,
        published: formData.published,
      }

      if (isEditing && formData.id) {
        const res = await fetch(`/api/admin/events/${formData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.error || (data.errors ? Object.values(data.errors).join(', ') : 'Failed to update event')
          throw new Error(msg)
        }

        setEvents((prev) =>
          prev.map((e) => (e.id === formData.id ? (data.event as Event) : e))
        )
        showFeedback('Event updated successfully.')
      } else {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.error || (data.errors ? Object.values(data.errors).join(', ') : 'Failed to create event')
          throw new Error(msg)
        }

        setEvents((prev) => [data.event as Event, ...prev])
        setTotal((prev) => prev + 1)
        showFeedback('Event created successfully.')
      }

      setIsModalOpen(false)
    } catch (err) {
      showFeedback((err as Error).message || 'An error occurred', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Quick Toggle Published
  const handleTogglePublish = async (event: Event) => {
    const newStatus = !event.published
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, published: newStatus } : e))
      )
      showFeedback(`Event ${newStatus ? 'published' : 'unpublished'} successfully.`)
    } catch {
      showFeedback('Failed to update event status.', 'error')
    }
  }

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete event')

      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      setTotal((prev) => Math.max(0, prev - 1))
      showFeedback('Event deleted successfully.')
      setDeleteTarget(null)
    } catch {
      showFeedback('Failed to delete event.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && e.published) ||
      (statusFilter === 'DRAFT' && !e.published)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-800 text-white'
              : 'bg-red-800 text-white'
          }`}
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">Events</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage upcoming workshops, cleanups, fundraisers, and community events. ({total} total)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-navy text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-border-soft shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search events by title, category, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-warm-white border border-border-soft rounded-xl text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          />
          <svg className="w-4 h-4 text-text-secondary absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-warm-white text-text-secondary hover:bg-brand-cream border border-border-soft'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events found"
            message={
              search || statusFilter !== 'ALL'
                ? 'No events match your current filter criteria.'
                : 'No events have been added yet. Click "Add Event" above to create your first event.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-border-soft text-brand-navy font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-brand-warm-white/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-navy text-sm leading-tight block">
                          {evt.title}
                        </span>
                        {evt.featured && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      {evt.shortDescription && (
                        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                          {evt.shortDescription}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 bg-brand-sage/40 text-brand-navy text-xs font-bold rounded-full border border-border-soft">
                        {evt.category || 'Environmental'}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-xs text-text-secondary font-medium">
                      <p className="font-semibold text-brand-navy">
                        {new Date(evt.date).toLocaleDateString('en-CA', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {evt.startTime}
                        {evt.endTime ? ` – ${evt.endTime}` : ''}
                      </p>
                    </td>

                    <td className="px-4 py-4 max-w-[180px] text-xs text-text-secondary truncate">
                      {evt.location}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={evt.published ? 'PUBLISHED' : 'DRAFT'} />
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(evt)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-warm-white hover:bg-brand-cream border border-border-soft transition-colors"
                        >
                          {evt.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-navy hover:bg-brand-cream transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(evt)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft mb-6">
              <h2 className="text-xl font-extrabold text-brand-navy">
                {isEditing ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-brand-navy text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Community Waterway Cleanup"
                  className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan bg-white"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.date}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  />
                  {formErrors.startTime && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 01:00 PM"
                    className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. High Park Nature Centre, Toronto"
                  className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                {formErrors.location && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Registration Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.registrationLink}
                  onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                  placeholder="https://eventbrite.com/..."
                  className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Short Summary (Card Preview)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief 1-sentence summary for cards..."
                  className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  Full Event Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the event..."
                  className="w-full px-3.5 py-2.5 border border-border-soft rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Switches / Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border-soft">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-navy">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-cyan"
                  />
                  Publish Event Immediately
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-navy">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-cyan"
                  />
                  Feature on Homepage
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-navy">
                  <input
                    type="checkbox"
                    checked={formData.registrationOpen}
                    onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-cyan"
                  />
                  Registration Open
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-brand-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand-green hover:bg-brand-navy text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border-soft">
            <h3 className="text-lg font-bold text-brand-navy mb-2">Confirm Delete</h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-brand-navy">&quot;{deleteTarget.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-brand-navy transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
