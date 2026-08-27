// ─── Public API: GET /api/programs ───────────────────────────────────────────

import { NextResponse } from 'next/server'
import { getPublishedPrograms } from '@/lib/programs'

export async function GET() {
  try {
    const programs = await getPublishedPrograms()
    return NextResponse.json({ programs })
  } catch (err) {
    console.error('[Public Programs API] Error:', err)
    return NextResponse.json({ error: 'Failed to load programs.' }, { status: 500 })
  }
}
