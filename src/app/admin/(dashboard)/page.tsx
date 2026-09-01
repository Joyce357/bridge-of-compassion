// ─── Admin Dashboard Page ──────────────────────────────────────────────────
// Server component: fetches real counts & submissions directly from Neon DB.

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [
      totalContacts,
      newContacts,
      totalVolunteers,
      newVolunteers,
      activeSubscribers,
      totalSubscribers,
      publishedPrograms,
      publishedEvents,
      publishedPosts,
      totalPhotos,
      completedDonations,
      completedDonationAgg,
      recentContacts,
      recentVolunteers,
      recentDonations,
    ] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'NEW' } }),
      prisma.volunteerApplication.count(),
      prisma.volunteerApplication.count({ where: { status: { in: ['NEW', 'REVIEWING'] } } }),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.newsletterSubscriber.count(),
      prisma.program.count({ where: { status: 'PUBLISHED' } }),
      prisma.event.count({ where: { published: true } }),
      prisma.newsPost.count({ where: { published: true } }),
      prisma.galleryItem.count(),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.volunteerApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.donation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      totalContacts,
      newContacts,
      totalVolunteers,
      newVolunteers,
      activeSubscribers,
      totalSubscribers,
      publishedPrograms,
      publishedEvents,
      publishedPosts,
      totalPhotos,
      completedDonations,
      totalRaised: Number(completedDonationAgg._sum.amount || 0),
      recentContacts,
      recentVolunteers,
      recentDonations,
    }
  } catch (err) {
    console.error('[Admin Dashboard] DB stats query failed:', (err as Error)?.message)
    return {
      totalContacts:      0,
      newContacts:        0,
      totalVolunteers:    0,
      newVolunteers:      0,
      activeSubscribers:  0,
      totalSubscribers:   0,
      publishedPrograms:  0,
      publishedEvents:    0,
      publishedPosts:     0,
      totalPhotos:        0,
      completedDonations: 0,
      totalRaised:        0,
      recentContacts:     [],
      recentVolunteers:   [],
      recentDonations:    [],
    }
  }
}

export default async function AdminDashboardPage() {
  const {
    totalContacts,
    newContacts,
    totalVolunteers,
    newVolunteers,
    activeSubscribers,
    totalSubscribers,
    publishedPrograms,
    publishedEvents,
    publishedPosts,
    completedDonations,
    totalRaised,
    recentContacts,
    recentVolunteers,
    recentDonations,
  } = await getStats()

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy-mid to-brand-green/80 rounded-3xl p-6 sm:p-8 text-brand-warm-white relative overflow-hidden shadow-card">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-3">
            <span>🌱</span> Live Platform Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to Bridge of Compassion
          </h1>
          <p className="text-brand-warm-white/80 text-sm sm:text-base leading-relaxed">
            Monitor community outreach, donations, volunteer applications, and program impact from your unified mission hub.
          </p>
        </div>
      </div>

      {/* 6-Card Stat Grid (Including Real Donation KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        <StatCard
          label="Total Raised"
          value={`$${totalRaised.toFixed(2)}`}
          icon="💰"
          subLabel="CAD (completed)"
          subValue={`${completedDonations} gifts`}
          color="green"
        />
        <StatCard
          label="Active Programs"
          value={publishedPrograms}
          icon="🌱"
          color="cyan"
        />
        <StatCard
          label="Upcoming Events"
          value={publishedEvents}
          icon="📅"
          color="green"
        />
        <StatCard
          label="Volunteers"
          value={totalVolunteers}
          icon="🤝"
          subLabel="in review"
          subValue={newVolunteers}
          color="orange"
        />
        <StatCard
          label="Contact Inquiries"
          value={totalContacts}
          icon="✉️"
          subLabel="new"
          subValue={newContacts}
          color="pink"
        />
        <StatCard
          label="Newsletter Subs"
          value={activeSubscribers}
          icon="📬"
          subLabel="total"
          subValue={totalSubscribers}
          color="purple"
        />
      </div>

      {/* Main Grid: Left (Recent Activity) & Right (Quick Actions & Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Recent Submissions / Table */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Donations */}
          <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy text-base">Recent Donations</h2>
                <p className="text-xs text-text-secondary mt-0.5">Real-time payment ledger & donor gifts</p>
              </div>
              <Link href="/admin/donations" className="text-xs text-brand-green hover:text-brand-navy font-semibold transition-colors">
                View all donations →
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-text-secondary text-sm">No donations recorded yet.</p>
                <p className="text-xs text-text-secondary/70 mt-1">Confirmed PayPal donations will show here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                    <tr>
                      <th className="px-6 py-3">Donor</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft/60">
                    {recentDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-brand-navy truncate max-w-[140px]">
                          {d.isAnonymous ? 'Anonymous' : (d.donorName || 'Supporter')}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-brand-navy">
                          {d.currency} ${Number(d.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-3.5 text-text-secondary text-xs">{formatDate(d.createdAt)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <StatusBadge status={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Contact Submissions */}
          <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy text-base">Recent Inquiries</h2>
                <p className="text-xs text-text-secondary mt-0.5">Direct messages and general questions</p>
              </div>
              <Link href="/admin/contacts" className="text-xs text-brand-green hover:text-brand-navy font-semibold transition-colors">
                View all inquiries →
              </Link>
            </div>

            {recentContacts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-text-secondary text-sm">No inquiries yet.</p>
                <p className="text-xs text-text-secondary/70 mt-1">New contact form messages will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft/60">
                    {recentContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-brand-navy truncate max-w-[140px]">{c.name}</td>
                        <td className="px-6 py-3.5 text-text-secondary truncate max-w-[180px]">{c.subject}</td>
                        <td className="px-6 py-3.5 text-text-secondary text-xs">{formatDate(c.createdAt)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Volunteer Applications */}
          <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy text-base">Volunteer Applications</h2>
                <p className="text-xs text-text-secondary mt-0.5">Community members eager to participate</p>
              </div>
              <Link href="/admin/volunteers" className="text-xs text-brand-green hover:text-brand-navy font-semibold transition-colors">
                View all volunteers →
              </Link>
            </div>

            {recentVolunteers.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-text-secondary text-sm">No volunteer applications yet.</p>
                <p className="text-xs text-text-secondary/70 mt-1">Applications from the volunteer page will show here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                    <tr>
                      <th className="px-6 py-3">Applicant</th>
                      <th className="px-6 py-3">Interests</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft/60">
                    {recentVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-brand-navy truncate max-w-[140px]">
                          {v.firstName} {v.lastName}
                        </td>
                        <td className="px-6 py-3.5 text-text-secondary truncate max-w-[180px]">
                          {v.interests.join(', ') || 'General'}
                        </td>
                        <td className="px-6 py-3.5 text-text-secondary text-xs">{formatDate(v.createdAt)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <StatusBadge status={v.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Quick Actions & Status */}
        <div className="space-y-6">

          {/* Quick Actions Card */}
          <div className="bg-brand-warm-white rounded-2xl p-6 shadow-card border border-border-soft">
            <h2 className="text-base font-bold text-brand-navy mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/donations"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-green text-brand-warm-white font-semibold text-sm hover:bg-brand-green/90 shadow-sm transition-all"
              >
                <span>Manage Donations</span>
                <span className="text-xs opacity-75">💰</span>
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-warm-white text-brand-navy font-medium text-sm border border-border-soft hover:border-brand-green/40 hover:bg-[#F8FAF6] transition-all"
              >
                <span>Manage & Create Events</span>
                <span className="text-xs opacity-75">📅</span>
              </Link>
              <Link
                href="/admin/news/new"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-sky text-brand-navy font-semibold text-sm hover:bg-brand-sky/80 transition-all border border-brand-cyan/20"
              >
                <span>+ Post Story / News</span>
                <span className="text-xs opacity-75">📰</span>
              </Link>
              <Link
                href="/admin/volunteers"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-warm-white text-brand-navy font-medium text-sm border border-border-soft hover:border-brand-green/40 hover:bg-[#F8FAF6] transition-all"
              >
                <span>Review Volunteers</span>
                <span className="text-xs opacity-75">🤝</span>
              </Link>
              <Link
                href="/admin/contacts"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-warm-white text-brand-navy font-medium text-sm border border-border-soft hover:border-brand-green/40 hover:bg-[#F8FAF6] transition-all"
              >
                <span>View All Inquiries</span>
                <span className="text-xs opacity-75">✉️</span>
              </Link>
            </div>
          </div>

          {/* Content Overview Card */}
          <div className="bg-brand-warm-white rounded-2xl p-6 shadow-card border border-border-soft">
            <h2 className="text-base font-bold text-brand-navy mb-4">Content Summary</h2>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2 border-b border-border-soft/60 text-sm">
                <span className="text-text-secondary">Completed Donations</span>
                <span className="font-bold text-brand-green">{completedDonations}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-soft/60 text-sm">
                <span className="text-text-secondary">Published Events</span>
                <span className="font-bold text-brand-navy">{publishedEvents}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-soft/60 text-sm">
                <span className="text-text-secondary">Published Stories</span>
                <span className="font-bold text-brand-navy">{publishedPosts}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-soft/60 text-sm">
                <span className="text-text-secondary">Pending Inquiries</span>
                <span className="font-bold text-brand-green">{newContacts}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-text-secondary">Pending Volunteers</span>
                <span className="font-bold text-accent-orange">{newVolunteers}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
