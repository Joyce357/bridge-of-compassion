import type { Story, ImpactStat } from '@/types'

// ─── Stories / News ───────────────────────────────────────────────────────
// NOTE: Placeholder content — client to provide real stories and news

export const stories: Story[] = [
  {
    id: 'waterway-restoration-story',
    title: 'How Community Volunteers Restored a Local Waterway',
    excerpt:
      'When a community waterway fell into neglect, a small group of volunteers came together with a big vision. Today, that waterway is thriving — and so is the community around it.',
    category: 'Environmental',
    date: '2025-08-01',
    imagePlaceholder: 'Before and after photo of restored local waterway',
    href: '/news/waterway-restoration-story',
    readTime: '4 min read',
  },
  {
    id: 'youth-mentorship-impact',
    title: 'From Mentee to Mentor: One Youth\'s Journey',
    excerpt:
      'At 16, Jordan joined our youth program unsure of the future. At 22, Jordan is now mentoring the next generation. This is what compassion in action looks like.',
    category: 'Youth',
    date: '2025-07-15',
    imagePlaceholder: 'Young mentor working with a group of youth participants',
    href: '/news/youth-mentorship-impact',
    readTime: '5 min read',
  },
  {
    id: 'community-garden-launch',
    title: 'New Community Garden Opens its Gates',
    excerpt:
      'Our latest sustainability initiative has transformed an unused lot into a thriving community garden — bringing fresh produce and fresh connections to the neighbourhood.',
    category: 'Community',
    date: '2025-07-01',
    imagePlaceholder: 'Community members working in a vibrant community garden',
    href: '/news/community-garden-launch',
    readTime: '3 min read',
  },
]

// ─── Impact Statistics ────────────────────────────────────────────────────
// NOTE: All figures are PLACEHOLDERS — do not publish without client verification.
// Marked clearly for replacement with verified organizational data.

export const impactStats: ImpactStat[] = [
  {
    value: '[TBC]',
    label: 'Communities Reached',
    description: 'Neighbourhoods and communities touched by our programs',
    icon: '🏘️',
  },
  {
    value: '[TBC]',
    label: 'Volunteers Engaged',
    description: 'Dedicated volunteers who make our mission possible',
    icon: '🤝',
  },
  {
    value: '[TBC]',
    label: 'Environmental Projects',
    description: 'Conservation and stewardship initiatives completed',
    icon: '🌿',
  },
  {
    value: '[TBC]',
    label: 'People Supported',
    description: 'Individuals and families who received direct support',
    icon: '💙',
  },
]
