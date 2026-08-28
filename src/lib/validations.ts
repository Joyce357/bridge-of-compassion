// ─── Zod Validation Schemas ───────────────────────────────────────────────
// All server-side input validation uses Zod.
// These schemas are used directly in API route handlers.

import { z } from 'zod'

// ─── Contact Form ─────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be under 100 characters.')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(254, 'Email address is too long.')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .max(30, 'Phone number is too long.')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters.')
    .max(200, 'Subject must be under 200 characters.')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(5000, 'Message must be under 5,000 characters.')
    .trim(),
})

export type ContactInput = z.infer<typeof contactSchema>

// ─── Volunteer Application ────────────────────────────────────────────────────

export const VOLUNTEER_INTERESTS = [
  'Community Development',
  'Environmental Stewardship',
  'Youth Programs',
  'Event Support',
  'Fundraising',
  'Administration',
  'Communications & Social Media',
  'Other',
] as const

export const VOLUNTEER_AVAILABILITY = [
  'Weekdays',
  'Weekends',
  'Evenings',
  'Flexible',
  'As Needed',
] as const

export const volunteerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name is too long.')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name is too long.')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(254)
    .toLowerCase()
    .trim(),
  phone: z.string().max(30).optional().or(z.literal('')),
  location: z.string().max(150).optional().or(z.literal('')),
  interests: z
    .array(z.string())
    .min(1, 'Please select at least one area of interest.'),
  availability: z.string().min(1, 'Please select your availability.'),
  message: z.string().max(2000).optional().or(z.literal('')),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must consent to proceed.'),
})

export type VolunteerInput = z.infer<typeof volunteerSchema>

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(254)
    .toLowerCase()
    .trim(),
  firstName: z.string().max(50).optional().or(z.literal('')),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

// ─── Newsletter Unsubscribe ───────────────────────────────────────────────────

export const unsubscribeSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

// ─── Donation ─────────────────────────────────────────────────────────────────

export const donationSchema = z.object({
  amount: z
    .number({ error: 'Amount must be a number.' })
    .positive('Amount must be greater than zero.')
    .max(100000, 'Please contact us for donations over $100,000.'),
  currency: z.enum(['CAD', 'USD']).default('CAD'),
  donorName:  z.string().max(150).optional().or(z.literal('')),
  donorEmail: z
    .string()
    .email('Please enter a valid email address.')
    .max(254)
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  donorPhone: z.string().max(30).optional().or(z.literal('')),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500).optional().or(z.literal('')),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'ANNUAL']).default('ONE_TIME'),
})

export type DonationInput = z.infer<typeof donationSchema>

// ─── Programs ─────────────────────────────────────────────────────────────────

export const PROGRAM_CATEGORIES = [
  'Environmental Education',
  'Outdoor Learning',
  'Youth Leadership',
  'Community Action',
  'Water & Climate',
  'Sustainability',
  'Conservation',
  'Tree Planting',
  'Community Cleanups',
  'Biodiversity',
] as const

export const programSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters.')
    .max(150, 'Title is too long.')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters.')
    .max(150, 'Slug is too long.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens).')
    .trim(),
  category: z
    .string()
    .min(2, 'Category is required.')
    .max(100, 'Category is too long.')
    .trim(),
  shortDescription: z
    .string()
    .min(10, 'Short description must be at least 10 characters.')
    .max(400, 'Short description must be under 400 characters.')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(10000, 'Description must be under 10,000 characters.')
    .trim(),
  imageUrl: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('')),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

export type ProgramInput = z.infer<typeof programSchema>

// ─── Events ───────────────────────────────────────────────────────────────────

export const EVENT_CATEGORIES = [
  'Environmental',
  'Volunteer',
  'Fundraiser',
  'Youth',
  'Community',
  'Workshop',
  'Education',
] as const

export const eventSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters.')
    .max(150, 'Title is too long.')
    .trim(),
  category: z.string().min(1, 'Category is required.').default('Environmental'),
  shortDescription: z
    .string()
    .max(400, 'Short description is too long.')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(10000, 'Description is too long.')
    .trim(),
  date: z.union([z.string().min(1, 'Date is required.'), z.date()]),
  startTime: z.string().min(1, 'Start time is required.').trim(),
  endTime: z.string().optional().nullable().or(z.literal('')),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters.')
    .max(200, 'Location is too long.')
    .trim(),
  featuredImage: z.string().optional().nullable().or(z.literal('')),
  registrationLink: z
    .string()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Registration link must be a valid URL starting with http:// or https://',
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  registrationOpen: z.boolean().default(true),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

export type EventInput = z.infer<typeof eventSchema>

// ─── News & Stories ─────────────────────────────────────────────────────────

export const NEWS_CATEGORIES = [
  'Environmental',
  'Youth',
  'Community',
  'Conservation',
  'Education',
  'Impact',
  'Announcement',
] as const

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

/**
 * Generates category badge color style.
 */
export function getNewsCategoryStyle(category?: string | null): { bg: string; text: string; border: string } {
  switch (category?.toLowerCase()) {
    case 'environmental':
    case 'conservation':
      return { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20' }
    case 'youth':
    case 'education':
      return { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/20' }
    case 'community':
    case 'impact':
      return { bg: 'bg-brand-navy/10', text: 'text-brand-navy', border: 'border-brand-navy/20' }
    default:
      return { bg: 'bg-brand-leaf/10', text: 'text-brand-leaf', border: 'border-brand-leaf/20' }
  }
}

export const newsSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters.')
    .max(200, 'Title is too long.')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters.')
    .max(200, 'Slug is too long.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, and hyphens).')
    .trim(),
  excerpt: z
    .string()
    .max(600, 'Excerpt must be under 600 characters.')
    .optional()
    .nullable()
    .or(z.literal('')),
  content: z
    .string()
    .min(10, 'Story content must be at least 10 characters.')
    .max(50000, 'Story content is too long.')
    .trim(),
  category: z
    .string()
    .max(100, 'Category is too long.')
    .optional()
    .nullable()
    .or(z.literal('')),
  author: z
    .string()
    .max(100, 'Author name is too long.')
    .optional()
    .nullable()
    .or(z.literal('')),
  featuredImage: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .or(z.literal('')),
  imagePublicId: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
})

export type NewsInput = z.infer<typeof newsSchema>

// ─── Gallery ──────────────────────────────────────────────────────────────────

export const GALLERY_CATEGORIES = [
  'Community',
  'Conservation',
  'Youth',
  'Events',
  'Education',
  'Restoration',
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

/**
 * Generates gallery category badge color style.
 */
export function getGalleryCategoryStyle(category?: string | null): { bg: string; text: string; border: string } {
  switch (category?.toLowerCase()) {
    case 'conservation':
    case 'restoration':
      return { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20' }
    case 'youth':
    case 'education':
      return { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/20' }
    case 'events':
      return { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20' }
    case 'community':
    default:
      return { bg: 'bg-brand-navy/10', text: 'text-brand-navy', border: 'border-brand-navy/20' }
  }
}

export const gallerySchema = z.object({
  title: z.string().max(200, 'Title is too long.').optional().nullable().or(z.literal('')),
  caption: z.string().max(500, 'Caption is too long.').optional().nullable().or(z.literal('')),
  altText: z.string().max(200, 'Alt text is too long.').optional().nullable().or(z.literal('')),
  imageUrl: z.string().min(1, 'Image URL is required.').max(1000),
  imagePublicId: z.string().max(300).optional().nullable().or(z.literal('')),
  category: z.string().max(100).optional().nullable().or(z.literal('')).default('Community'),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  published: z.boolean().default(false),
})

export type GalleryInput = z.infer<typeof gallerySchema>

// ─── Admin: Change Password ───────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(10, 'New password must be at least 10 characters.')
      .max(128, 'Password is too long.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ─── Admin: Update Profile ────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name:  z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase().trim(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format Zod errors into a flat key → message object for API responses.
 */
export function formatZodErrors(
  error: z.ZodError,
): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.')
    acc[key] = issue.message
    return acc
  }, {})
}

