// ─── GET /api/events/[id] ────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const event = await prisma.event.findFirst({
      where: { id: params.id, published: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
    }

    return NextResponse.json({ event }, { status: 200 })
  } catch (err) {
    console.error('[Events/ID API] Error:', err)
    return NextResponse.json({ error: 'Failed to load event.' }, { status: 500 })
  }
}
