// ─── GET /api/events ─────────────────────────────────────────────────────
// Returns published events, ordered by date ascending.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where:   { published: true },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ events }, { status: 200 })
  } catch (err) {
    console.error('[Events API] Error:', err)
    return NextResponse.json({ error: 'Failed to load events.' }, { status: 500 })
  }
}
