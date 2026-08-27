// ─── Admin API: /api/admin/programs ──────────────────────────────────────────
// GET:  List all programs with pagination and filtering
// POST: Create a new program record

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { programSchema, formatZodErrors } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const search = searchParams.get('search')?.trim()
    const status = searchParams.get('status')?.trim()

    const where: Record<string, unknown> = {}
    if (status && (status === 'DRAFT' || status === 'PUBLISHED')) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.program.count({ where }),
    ])

    return NextResponse.json({ programs, total, page, limit })
  } catch (err) {
    console.error('[Admin Programs GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load programs.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()
    const result = programSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    // Check slug uniqueness
    const existingSlug = await prisma.program.findUnique({
      where: { slug: data.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A program with this slug already exists. Please choose a unique slug.' },
        { status: 409 },
      )
    }

    const program = await prisma.program.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        shortDescription: data.shortDescription,
        description: data.description,
        imageUrl: data.imageUrl || null,
        featured: data.featured,
        displayOrder: data.displayOrder,
        status: data.status,
      },
    })

    revalidatePath('/programs')
    revalidatePath(`/programs/${program.slug}`)
    revalidatePath('/')

    return NextResponse.json({ program }, { status: 201 })
  } catch (err) {
    console.error('[Admin Programs POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create program.' }, { status: 500 })
  }
}
