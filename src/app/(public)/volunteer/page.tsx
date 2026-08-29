// ─── Volunteer Page ───────────────────────────────────────────────────────
import type { Metadata } from 'next'
import VolunteerLanding from '@/components/volunteer/VolunteerLanding'

export const metadata: Metadata = {
  title: 'Volunteer with Us',
  description: 'Join the Bridge of Compassion volunteer team. Apply to volunteer and make a difference in your community.',
  alternates: { canonical: 'https://bridgeofcompassion.org/volunteer' },
}

export default function VolunteerPage() {
  return <VolunteerLanding />
}
