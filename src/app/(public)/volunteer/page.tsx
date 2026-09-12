// ─── Volunteer Page ─────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import VolunteerLanding from '@/components/volunteer/VolunteerLanding'
import { getCanonicalUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Volunteer',
  description: 'Join the Bridge of Compassion volunteer team. Apply to volunteer and make a difference through environmental education and community conservation.',
  alternates: { canonical: getCanonicalUrl('/volunteer') },
  openGraph: { url: getCanonicalUrl('/volunteer') },
}

export default function VolunteerPage() {
  return <VolunteerLanding />
}
