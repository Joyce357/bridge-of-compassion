// ─── Shared TypeScript Types for Bridge of Compassion ────────────────────

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface Program {
  id: string
  title: string
  slug: string
  category: string
  shortDescription: string
  description: string
  imageUrl?: string | null
  featured: boolean
  displayOrder: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Event {
  id: string
  title: string
  category: string
  shortDescription?: string | null
  description: string
  date: Date | string
  startTime: string
  endTime?: string | null
  location: string
  featuredImage?: string | null
  registrationLink?: string | null
  registrationOpen: boolean
  featured: boolean
  published: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface NewsPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  category?: string | null
  featuredImage?: string | null
  imagePublicId?: string | null
  author?: string | null
  featured: boolean
  published: boolean
  publishedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Story {
  id: string
  title: string
  excerpt: string
  category: string
  date: string            // ISO date string
  imagePlaceholder: string
  href: string
  readTime: string
}

export interface ImpactStat {
  value: string           // e.g. "500+" — placeholder until client provides real data
  label: string
  description: string
  icon: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  imagePlaceholder: string
}

export interface GalleryItem {
  id: string
  title?: string | null
  caption?: string | null
  altText?: string | null
  imageUrl: string
  imagePublicId?: string | null
  category?: string | null
  featured: boolean
  displayOrder: number
  published: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  caption?: string
  category: string
  width: number
  height: number
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface VolunteerFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  interests: string[]
  availability: string
  message?: string
  consent: boolean
}

export interface VolunteerCommunication {
  id: string
  volunteerApplicationId: string
  subject: string
  message: string
  recipientEmail: string
  sentByUserId?: string | null
  sentByName?: string | null
  sentAt: Date | string
  deliveryStatus: string
  providerMessageId?: string | null
  createdAt: Date | string
}

export interface VolunteerApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  location?: string | null
  interests: string[]
  availability: string
  message?: string | null
  consent: boolean
  status: 'NEW' | 'REVIEWING' | 'CONTACTED' | 'ACTIVE' | 'INACTIVE'
  adminNotes?: string | null
  communications?: VolunteerCommunication[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface NewsletterFormData {
  email: string
  firstName?: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'cyan' | 'environmental' | 'outline-green' | 'soft' | 'tertiary'
export type ButtonSize = 'sm' | 'md' | 'lg'
