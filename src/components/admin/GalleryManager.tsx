// ─── Gallery Manager (Admin) ─────────────────────────────────────────────
'use client'

import { useState, useTransition, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types'
import { GALLERY_CATEGORIES, getGalleryCategoryStyle } from '@/lib/validations'
import StatusBadge from './StatusBadge'
import EmptyState from './EmptyState'

interface GalleryManagerProps {
  initialItems: GalleryItem[]
  totalCount: number
}

interface FormState {
  title: string
  caption: string
  altText: string
  imageUrl: string
  imagePublicId: string
  category: string
  featured: boolean
  published: boolean
  displayOrder: number
}

const defaultFormState: FormState = {
  title: '',
  caption: '',
  altText: '',
  imageUrl: '',
  imagePublicId: '',
  category: 'Community',
  featured: false,
  published: true,
  displayOrder: 0,
}

export default function GalleryManager({ initialItems, totalCount }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [total, setTotal] = useState(totalCount)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'FEATURED'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState<FormState>(defaultFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [, startTransition] = useTransition()

  // Open modal for Create
  const openCreateModal = () => {
    setEditingItem(null)
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) + 1 : 1
    setFormData({
      ...defaultFormState,
      displayOrder: nextOrder,
    })
    setErrors({})
    setBannerMsg(null)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      caption: item.caption || '',
      altText: item.altText || '',
      imageUrl: item.imageUrl || '',
      imagePublicId: item.imagePublicId || '',
      category: item.category || 'Community',
      featured: item.featured,
      published: item.published,
      displayOrder: item.displayOrder,
    })
    setErrors({})
    setBannerMsg(null)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData(defaultFormState)
    setErrors({})
  }

  // Handle Cloudinary Image Upload
  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please choose a JPEG, PNG, or WebP image.' }))
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size exceeds 8 MB limit.' }))
      return
    }

    setUploadingImage(true)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.image
      return next
    })

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/admin/gallery/image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, image: data.error || 'Failed to upload image.' }))
      } else {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.imageUrl,
          imagePublicId: data.imagePublicId,
        }))
      }
    } catch {
      setErrors((prev) => ({ ...prev, image: 'Network error during image upload.' }))
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Remove image from form
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
      imagePublicId: '',
    }))
  }

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!formData.imageUrl) {
      setErrors({ image: 'Please upload an image for the gallery photo.' })
      return
    }

    setIsSaving(true)

    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : '/api/admin/gallery'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields)
        }
        setBannerMsg({ type: 'error', text: data.error || 'Failed to save gallery photo.' })
      } else {
        const savedItem: GalleryItem = data.item
        setBannerMsg({
          type: 'success',
          text: editingItem ? 'Photo updated successfully!' : 'Photo added to gallery successfully!',
        })

        startTransition(() => {
          if (editingItem) {
            setItems((prev) =>
              prev
                .map((i) => (i.id === savedItem.id ? savedItem : i))
                .sort((a, b) => a.displayOrder - b.displayOrder),
            )
          } else {
            setItems((prev) =>
              [...prev, savedItem].sort((a, b) => a.displayOrder - b.displayOrder),
            )
            setTotal((prev) => prev + 1)
          }
        })
        closeModal()
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error while saving photo.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Quick Toggle Published
  const handleTogglePublished = async (item: GalleryItem) => {
    const nextPublished = !item.published
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished }),
      })

      const data = await res.json()
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)))
        setBannerMsg({
          type: 'success',
          text: `Photo status updated to ${nextPublished ? 'Published' : 'Draft'}.`,
        })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to update publication status.' })
    }
  }

  // Quick Toggle Featured
  const handleToggleFeatured = async (item: GalleryItem) => {
    const nextFeatured = !item.featured
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      })

      const data = await res.json()
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)))
        setBannerMsg({
          type: 'success',
          text: `Photo ${nextFeatured ? 'is now Featured' : 'removed from Featured'}.`,
        })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to update featured status.' })
    }
  }

  // Reorder Item: Move Up / Down
  const handleMoveOrder = async (item: GalleryItem, direction: 'UP' | 'DOWN') => {
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder)
    const currentIndex = sorted.findIndex((i) => i.id === item.id)
    if (currentIndex === -1) return

    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const targetItem = sorted[targetIndex]
    const currentOrder = item.displayOrder
    const targetOrder = targetItem.displayOrder

    // If both had the same order, assign distinct values
    const newCurrentOrder = currentOrder === targetOrder
      ? direction === 'UP' ? targetOrder - 1 : targetOrder + 1
      : targetOrder
    const newTargetOrder = currentOrder

    try {
      // Optimistic update
      setItems((prev) =>
        prev
          .map((i) => {
            if (i.id === item.id) return { ...i, displayOrder: newCurrentOrder }
            if (i.id === targetItem.id) return { ...i, displayOrder: newTargetOrder }
            return i
          })
          .sort((a, b) => a.displayOrder - b.displayOrder),
      )

      await Promise.all([
        fetch(`/api/admin/gallery/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newCurrentOrder }),
        }),
        fetch(`/api/admin/gallery/${targetItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newTargetOrder }),
        }),
      ])

      setBannerMsg({ type: 'success', text: 'Gallery order updated successfully.' })
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to update gallery order.' })
    }
  }

  // Delete Item
  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        setTotal((prev) => Math.max(0, prev - 1))
        setBannerMsg({ type: 'success', text: 'Gallery photo deleted successfully.' })
        setDeleteConfirmId(null)
      } else {
        const data = await res.json()
        setBannerMsg({ type: 'error', text: data.error || 'Failed to delete photo.' })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error while deleting photo.' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered list
  const filteredItems = items
    .filter((item) => {
      const matchSearch =
        search === '' ||
        (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(search.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()))

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PUBLISHED'
          ? item.published
          : statusFilter === 'DRAFT'
          ? !item.published
          : item.featured

      const matchCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter

      return matchSearch && matchStatus && matchCategory
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-border-soft text-sm text-brand-navy
    bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all shadow-2xs`

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">Photo Gallery</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage photos, project highlights, and community media. ({total} total photos)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Photo
        </button>
      </div>

      {/* Notification banner */}
      {bannerMsg && (
        <div
          className={`text-sm px-4 py-3 rounded-xl flex items-center justify-between font-medium ${
            bannerMsg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span>{bannerMsg.text}</span>
          <button
            onClick={() => setBannerMsg(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-border-soft shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search photos by title, caption, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-soft text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/40 bg-brand-warm-white/40"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-2.5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-soft text-xs text-brand-navy bg-brand-warm-white/40 focus:outline-none focus:ring-2 focus:ring-brand-green/40"
          >
            <option value="ALL">All Categories</option>
            {GALLERY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex bg-brand-cream/60 p-1 rounded-xl border border-border-soft text-xs font-bold text-brand-navy">
            {(['ALL', 'PUBLISHED', 'DRAFT', 'FEATURED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white shadow-xs text-brand-navy'
                    : 'text-text-secondary hover:text-brand-navy'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon="🖼️"
            title="No gallery items found"
            message={
              search || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try adjusting your filters or search term.'
                : 'Get started by uploading your first community photo.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-border-soft text-brand-navy font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Photo</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5">Added</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {filteredItems.map((item, idx) => {
                  const catStyle = getGalleryCategoryStyle(item.category)
                  return (
                    <tr key={item.id} className="hover:bg-brand-warm-white/50 transition-colors">
                      {/* Order Controls */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-text-secondary w-6 text-center">
                            #{item.displayOrder}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(item, 'UP')}
                              disabled={idx === 0}
                              title="Move photo up"
                              className="p-1 text-text-secondary hover:text-brand-navy disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMoveOrder(item, 'DOWN')}
                              disabled={idx === filteredItems.length - 1}
                              title="Move photo down"
                              className="p-1 text-text-secondary hover:text-brand-navy disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Photo Thumbnail & Title/Caption */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border-soft bg-brand-cream/40">
                            <Image
                              src={item.imageUrl}
                              alt={item.altText || item.title || 'Gallery image'}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-brand-navy truncate">
                              {item.title || '(No title)'}
                            </p>
                            {item.caption && (
                              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                                {item.caption}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {item.category || 'Community'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublished(item)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          title="Click to toggle publish status"
                        >
                          <StatusBadge status={item.published ? 'PUBLISHED' : 'DRAFT'} />
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            item.featured
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-600'
                          }`}
                        >
                          {item.featured ? '★ Featured' : '☆ Normal'}
                        </button>
                      </td>

                      {/* Added Date */}
                      <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap font-medium">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-CA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-brand-navy hover:bg-brand-cream transition-colors cursor-pointer"
                            title="Edit photo details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-border-soft max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-border-soft/60 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy">
                  {editingItem ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Add photos of community activities, workshops, and restoration events.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-text-secondary hover:text-brand-navy p-1.5 rounded-xl hover:bg-brand-cream/60 transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Image Upload Component */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Photo <span className="text-red-500">*</span>
                </label>
                <div className="p-4 rounded-xl bg-brand-cream/40 border border-border-soft space-y-3">
                  {formData.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-border-soft bg-white">
                      <Image
                        src={formData.imageUrl}
                        alt="Gallery preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border-soft rounded-xl bg-white/60 text-center">
                      <svg className="w-8 h-8 text-text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-bold text-brand-navy mb-1">
                        {uploadingImage ? 'Uploading to Cloudinary…' : 'Select gallery photo'}
                      </p>
                      <p className="text-[11px] text-text-secondary">JPEG, PNG, or WebP. Max 8 MB.</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-dark transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        {uploadingImage ? 'Uploading…' : 'Choose File'}
                      </button>
                    </div>
                  )}
                  {errors.image && <p className="text-xs text-red-600 font-medium">{errors.image}</p>}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Volunteer Stream Cleanup 2025"
                  className={inputClass}
                />
                {errors.title && <p className="text-xs text-red-600 mt-1 font-medium">{errors.title}</p>}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Short description shown in lightbox and card details…"
                  className={inputClass}
                />
                {errors.caption && <p className="text-xs text-red-600 mt-1 font-medium">{errors.caption}</p>}
              </div>

              {/* Alt Text & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                    Alt Text (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Descriptive text for screen readers"
                    className={inputClass}
                  />
                  {errors.altText && <p className="text-xs text-red-600 mt-1 font-medium">{errors.altText}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {GALLERY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Order & Publication Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-brand-cream/40 border border-border-soft items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-brand-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  Published
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-brand-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  Featured Photo
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-border-soft bg-white"
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft/60">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-brand-cream/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingImage}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving…' : editingItem ? 'Update Photo' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-brand-navy">Delete Photo</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this photo? This will also remove the image asset from Cloudinary and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-brand-cream/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
