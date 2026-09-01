// ─── GET /api/admin/donations/export ──────────────────────────────────────
// Admin-protected CSV export for donation records.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { DonationStatus, Prisma } from '@prisma/client'

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  // Prevent CSV injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  // Escape double quotes
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const query = searchParams.get('q')?.trim() || ''

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

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    const headers = [
      'Donation ID',
      'Created At',
      'Donor Name',
      'Donor Email',
      'Anonymous',
      'Amount',
      'Currency',
      'Status',
      'Frequency',
      'Payment Provider',
      'PayPal Order ID',
      'PayPal Capture ID',
      'Receipt Sent',
      'Receipt Sent At',
      'Donor Message',
    ]

    const rows = donations.map((d) => [
      escapeCSV(d.id),
      escapeCSV(d.createdAt.toISOString()),
      escapeCSV(d.isAnonymous ? 'Anonymous' : (d.donorName || 'N/A')),
      escapeCSV(d.donorEmail || 'N/A'),
      escapeCSV(d.isAnonymous ? 'Yes' : 'No'),
      escapeCSV(Number(d.amount).toFixed(2)),
      escapeCSV(d.currency),
      escapeCSV(d.status),
      escapeCSV(d.frequency),
      escapeCSV(d.paymentProvider || 'paypal'),
      escapeCSV(d.paypalOrderId || ''),
      escapeCSV(d.paypalCaptureId || ''),
      escapeCSV(d.receiptSent ? 'Yes' : 'No'),
      escapeCSV(d.receiptSentAt ? d.receiptSentAt.toISOString() : ''),
      escapeCSV(d.message || ''),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const fileName = `donations-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error('[Admin Donations Export] Error:', err)
    return NextResponse.json({ error: 'Failed to generate CSV export.' }, { status: 500 })
  }
}
