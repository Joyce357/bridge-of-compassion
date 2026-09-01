// ─── GET /api/admin/donations ─────────────────────────────────────────────
// Admin-protected endpoint for listing, searching, filtering, and aggregating donation records.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { DonationStatus, Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const query = searchParams.get('q')?.trim() || ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))

    const where: Prisma.DonationWhereInput = {}

    if (statusParam && statusParam !== 'ALL' && Object.values(DonationStatus).includes(statusParam as DonationStatus)) {
      where.status = statusParam as DonationStatus
    }

    if (query) {
      where.OR = [
        { donorName: { contains: query, mode: 'insensitive' } },
        { donorEmail: { contains: query, mode: 'insensitive' } },
        { paypalOrderId: { contains: query, mode: 'insensitive' } },
        { paypalCaptureId: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Parallel fetch for list, filtered total, and summary statistics
    const [donations, filteredTotal, totalRecords, completedAgg, statusCounts] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
      prisma.donation.count(),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.donation.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ])

    const countMap: Record<string, number> = {}
    for (const item of statusCounts) {
      countMap[item.status] = item._count._all
    }

    const stats = {
      totalRaised: Number(completedAgg._sum.amount || 0),
      completedCount: countMap['COMPLETED'] || 0,
      pendingCount: countMap['PENDING'] || 0,
      refundedCount: countMap['REFUNDED'] || 0,
      failedCount: countMap['FAILED'] || 0,
      intentCount: countMap['INTENT'] || 0,
      cancelledCount: countMap['CANCELLED'] || 0,
      totalRecords,
    }

    return NextResponse.json({
      donations,
      total: filteredTotal,
      page,
      limit,
      stats,
    })
  } catch (err) {
    console.error('[Admin Donations API] Error:', err)
    return NextResponse.json({ error: 'Failed to load donations.' }, { status: 500 })
  }
}
