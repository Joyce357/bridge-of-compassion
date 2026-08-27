import type { Event } from '@/types'

// ─── Events Data ─────────────────────────────────────────────────────────
// NOTE: Reference dataset — public site and admin now query Neon PostgreSQL directly.

export const events: Event[] = [
  {
    id: 'community-cleanup-2025',
    title: 'Community Waterway Cleanup',
    date: '2025-09-20',
    startTime: '9:00 AM',
    endTime: '1:00 PM',
    location: '[Location TBC]',
    shortDescription: 'Join us for our seasonal waterway cleanup.',
    description:
      'Join us for our seasonal waterway cleanup. Bring gloves and a spirit of community — we supply the rest. All ages and abilities welcome.',
    category: 'Environmental',
    registrationLink: '#',
    registrationOpen: true,
    featured: true,
    published: true,
  },
  {
    id: 'volunteer-orientation-oct',
    title: 'Volunteer Orientation Session',
    date: '2025-10-04',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: '[Location TBC]',
    shortDescription: 'Attend our orientation to learn about volunteer opportunities.',
    description:
      'New to Bridge of Compassion? Attend our orientation to learn about volunteer opportunities, how we work, and how you can make an impact.',
    category: 'Volunteer',
    registrationLink: '#',
    registrationOpen: true,
    featured: false,
    published: true,
  },
  {
    id: 'annual-gala-2025',
    title: 'Annual Compassion Gala',
    date: '2025-11-15',
    startTime: '6:00 PM',
    endTime: '10:00 PM',
    location: '[Venue TBC]',
    shortDescription: 'Our flagship annual fundraising gala.',
    description:
      'Our flagship annual fundraising gala. An evening of community, celebration, and support for the work that matters most.',
    category: 'Fundraiser',
    registrationLink: '#',
    registrationOpen: true,
    featured: false,
    published: true,
  },
  {
    id: 'youth-workshop-nov',
    title: 'Youth Leadership Workshop',
    date: '2025-11-22',
    startTime: '2:00 PM',
    endTime: '5:00 PM',
    location: '[Location TBC]',
    shortDescription: 'An interactive workshop for young leaders aged 14–24.',
    description:
      'An interactive workshop for young leaders aged 14–24. Develop skills, build connections, and be part of the change.',
    category: 'Youth',
    registrationLink: '#',
    registrationOpen: true,
    featured: false,
    published: true,
  },
]
