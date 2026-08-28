// ─── News & Stories Manager (Admin) ─────────────────────────────────────────
'use client'

import { useState, useTransition, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import type { NewsPost } from '@/types'
import { NEWS_CATEGORIES, getNewsCategoryStyle } from '@/lib/validations'
import StatusBadge from './StatusBadge'
import EmptyState from './EmptyState'

interface NewsManagerProps {
  initialPosts: NewsPost[]
  totalCount: number
}

interface FormState {
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  author: string
  featuredImage: string
  imagePublicId: string
  featured: boolean
  published: boolean
  publishedAt: string
}

const defaultFormState: FormState = {
  title: '',
  slug: '',
  category: 'Environmental',
  excerpt: '',
  content: '',
  author: 'Bridge of Compassion Team',
  featuredImage: '',
  imagePublicId: '',
  featured: false,
  published: false,
  publishedAt: '',
}

export default function NewsManager({ initialPosts, totalCount }: NewsManagerProps) {
  const [posts, setPosts] = useState<NewsPost[]>(initialPosts)
  const [total, setTotal] = useState(totalCount)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'FEATURED'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
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

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => {
      const generatedSlug = prev.slug === '' || !editingPost
        ? newTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        : prev.slug
      return { ...prev, title: newTitle, slug: generatedSlug }
    })
  }

  // Open modal for Create
  const openCreateModal = () => {
    setEditingPost(null)
    setFormData({
      ...defaultFormState,
      publishedAt: new Date().toISOString().split('T')[0],
    })
    setErrors({})
    setBannerMsg(null)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const openEditModal = (post: NewsPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category || 'Environmental',
      excerpt: post.excerpt || '',
      content: post.content,
      author: post.author || '',
      featuredImage: post.featuredImage || '',
      imagePublicId: post.imagePublicId || '',
      featured: post.featured,
      published: post.published,
      publishedAt: post.publishedAt
        ? new Date(post.publishedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    })
    setErrors({})
    setBannerMsg(null)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
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

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size exceeds 5 MB limit.' }))
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

      const res = await fetch('/api/admin/news/image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, image: data.error || 'Failed to upload image.' }))
      } else {
        setFormData((prev) => ({
          ...prev,
          featuredImage: data.imageUrl,
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

  // Remove uploaded image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      featuredImage: '',
      imagePublicId: '',
    }))
  }

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSaving(true)

    const payload = {
      ...formData,
      publishedAt: formData.published && formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
    }

    try {
      const url = editingPost ? `/api/admin/news/${editingPost.id}` : '/api/admin/news'
      const method = editingPost ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields)
        }
        setBannerMsg({ type: 'error', text: data.error || 'Failed to save story.' })
      } else {
        const savedPost: NewsPost = data.post
        setBannerMsg({
          type: 'success',
          text: editingPost ? 'Story updated successfully!' : 'Story created successfully!',
        })

        startTransition(() => {
          if (editingPost) {
            setPosts((prev) => prev.map((p) => (p.id === savedPost.id ? savedPost : p)))
          } else {
            setPosts((prev) => [savedPost, ...prev])
            setTotal((prev) => prev + 1)
          }
        })
        closeModal()
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error while saving story.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Quick Toggle Published
  const handleTogglePublished = async (post: NewsPost) => {
    const nextPublished = !post.published
    try {
      const res = await fetch(`/api/admin/news/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished }),
      })

      const data = await res.json()
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)))
        setBannerMsg({
          type: 'success',
          text: `Story "${post.title}" is now ${nextPublished ? 'Published' : 'Draft'}.`,
        })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to update publication status.' })
    }
  }

  // Quick Toggle Featured
  const handleToggleFeatured = async (post: NewsPost) => {
    const nextFeatured = !post.featured
    try {
      const res = await fetch(`/api/admin/news/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      })

      const data = await res.json()
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)))
        setBannerMsg({
          type: 'success',
          text: `Story "${post.title}" ${nextFeatured ? 'is now Featured' : 'removed from Featured'}.`,
        })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to update featured status.' })
    }
  }

  // Delete Post
  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        setTotal((prev) => Math.max(0, prev - 1))
        setBannerMsg({ type: 'success', text: 'Story deleted successfully.' })
        setDeleteConfirmId(null)
      } else {
        const data = await res.json()
        setBannerMsg({ type: 'error', text: data.error || 'Failed to delete story.' })
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error while deleting story.' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered list
  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.author && p.author.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))

    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PUBLISHED'
        ? p.published
        : statusFilter === 'DRAFT'
        ? !p.published
        : p.featured

    const matchCategory =
      categoryFilter === 'ALL' || p.category === categoryFilter

    return matchSearch && matchStatus && matchCategory
  })

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-border-soft text-sm text-brand-navy
    bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all shadow-2xs`

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">News &amp; Stories</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage published news posts, community stories, and updates. ({total} total)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Story
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
            className="text-xs font-bold underline opacity-80 hover:opacity-100"
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
            placeholder="Search stories by title, author, or category…"
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
            {NEWS_CATEGORIES.map((cat) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden">
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No news posts found"
            message={
              search || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try adjusting your filters or search term.'
                : 'Get started by creating your first news post or impact story.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-border-soft text-brand-navy font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Story</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {filteredPosts.map((post) => {
                  const catStyle = getNewsCategoryStyle(post.category)
                  return (
                    <tr key={post.id} className="hover:bg-brand-warm-white/50 transition-colors">
                      {/* Story title & image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {post.featuredImage ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border-soft bg-brand-cream/30">
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-brand-sage/30 flex items-center justify-center text-xl shrink-0">
                              📰
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="font-bold text-brand-navy truncate">{post.title}</p>
                            <p className="text-xs text-text-secondary font-mono truncate">/news/{post.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {post.category || 'General'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap">
                        {post.author || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublished(post)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          title="Click to toggle publish status"
                        >
                          <StatusBadge status={post.published ? 'PUBLISHED' : 'DRAFT'} />
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            post.featured
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-gray-600'
                          }`}
                        >
                          {post.featured ? '★ Featured' : '☆ Normal'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-text-secondary whitespace-nowrap font-medium">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('en-CA', {
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
                            onClick={() => openEditModal(post)}
                            className="p-1.5 rounded-lg text-brand-navy hover:bg-brand-cream transition-colors cursor-pointer"
                            title="Edit story"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete story"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border-soft max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-border-soft/60 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy">
                  {editingPost ? 'Edit News Story' : 'Create News Story'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Fill in the details for your article or community impact story.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-text-secondary hover:text-brand-navy p-1.5 rounded-xl hover:bg-brand-cream/60 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How Community Volunteers Restored a Local Waterway"
                  className={inputClass}
                  required
                />
                {errors.title && <p className="text-xs text-red-600 mt-1 font-medium">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-border-soft bg-white overflow-hidden shadow-2xs">
                  <span className="px-3 py-2.5 bg-brand-cream/60 text-xs text-text-secondary font-mono border-r border-border-soft">
                    /news/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="how-community-volunteers-restored-waterway"
                    className="flex-1 px-3 py-2.5 text-xs font-mono text-brand-navy focus:outline-none"
                    required
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-600 mt-1 font-medium">{errors.slug}</p>}
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {NEWS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Bridge of Compassion Team"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Featured Image (Cloudinary) */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Story Featured Image
                </label>
                <div className="p-4 rounded-xl bg-brand-cream/40 border border-border-soft space-y-3">
                  {formData.featuredImage ? (
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border-soft bg-white">
                      <Image
                        src={formData.featuredImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border-soft rounded-xl bg-white/60 text-center">
                      <svg className="w-8 h-8 text-text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-bold text-brand-navy mb-1">
                        {uploadingImage ? 'Uploading to Cloudinary…' : 'Upload story hero photo'}
                      </p>
                      <p className="text-[11px] text-text-secondary">JPEG, PNG, or WebP. Max 5 MB.</p>
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
                        {uploadingImage ? 'Uploading…' : 'Select Photo'}
                      </button>
                    </div>
                  )}
                  {errors.image && <p className="text-xs text-red-600 font-medium">{errors.image}</p>}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short 1-2 sentence teaser for cards and search results…"
                  className={inputClass}
                />
                {errors.excerpt && <p className="text-xs text-red-600 mt-1 font-medium">{errors.excerpt}</p>}
              </div>

              {/* Story Content */}
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                  Story Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full story body here…"
                  className={inputClass}
                  required
                />
                {errors.content && <p className="text-xs text-red-600 mt-1 font-medium">{errors.content}</p>}
              </div>

              {/* Publication Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-brand-cream/40 border border-border-soft">
                <label className="flex items-center gap-2 text-xs font-bold text-brand-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  Publish Story
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-brand-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  Feature on Homepage
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
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
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving…' : editingPost ? 'Update Story' : 'Create Story'}
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
              <h3 className="text-lg font-bold text-brand-navy">Delete Story</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this news story? This will also remove any associated images from Cloudinary and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-brand-cream/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
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
