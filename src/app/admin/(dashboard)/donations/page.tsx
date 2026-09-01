// ─── Admin: Donations ─────────────────────────────────────────────────────
// Server component: loads real database donation records and stats for DonationsManager.

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DonationsManager from '@/components/admin/DonationsManager'
import type { Metadata } from 'next'
import type { DonationRecord, DonationSummaryStats } from '@/types'

export const metadata: Metadata = { title: 'Donations' }
export const dynamic = 'force-dynamic'

export default async function AdminDonationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [rawDonations, completedAgg, statusCounts, totalRecords] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.donation.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.donation.count(),
  ])

  const countMap: Record<string, number> = {}
  for (const item of statusCounts) {
    countMap[item.status] = item._count._all
  }

  const stats: DonationSummaryStats = {
    totalRaised: Number(completedAgg._sum.amount || 0),
    completedCount: countMap['COMPLETED'] || 0,
    pendingCount: countMap['PENDING'] || 0,
    refundedCount: countMap['REFUNDED'] || 0,
    failedCount: countMap['FAILED'] || 0,
    totalRecords,
  }

  // Clean serialization for client component
  const initialDonations: DonationRecord[] = rawDonations.map((d) => ({
    id:               d.id,
    amount:           Number(d.amount),
    currency:         d.currency,
    donorName:        d.donorName,
    donorEmail:       d.donorEmail,
    donorPhone:       d.donorPhone,
    isAnonymous:      d.isAnonymous,
    message:          d.message,
    frequency:        d.frequency as 'ONE_TIME' | 'MONTHLY' | 'ANNUAL',
    status:           d.status as DonationRecord['status'],

    paymentProvider:  d.paymentProvider,
    paymentRef:       d.paymentRef,
    paypalOrderId:    d.paypalOrderId,
    paypalCaptureId:  d.paypalCaptureId,
    paypalPayerId:    d.paypalPayerId,
    paypalPayerEmail: d.paypalPayerEmail,
    receiptSent:      d.receiptSent,
    receiptSentAt:    d.receiptSentAt ? d.receiptSentAt.toISOString() : null,
    createdAt:        d.createdAt.toISOString(),
    updatedAt:        d.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Donation Management
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Real-time Neon donation records and PayPal transaction ledger.
          </p>
        </div>
      </div>

      <DonationsManager
        initialDonations={initialDonations}
        initialStats={stats}
      />
    </div>
  )
}
