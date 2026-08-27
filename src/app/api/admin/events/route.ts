// ─── GET & POST /api/admin/events ──────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { eventSchema, formatZodErrors } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const take = limitParam ? Math.min(100, Math.max(1, Number(limitParam))) : 100

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
        take,
      }),
      prisma.event.count(),
    ])

    return NextResponse.json({ events, total })
  } catch (err) {
    console.error('[Admin Events GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load events.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = eventSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const event = await prisma.event.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error('[Admin Events POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 })
  }
}
