// ─── Admin API: /api/admin/programs/[id] ────────────────────────────────────
// GET:    Retrieve program by ID
// PATCH:  Update program fields (with validation & uniqueness checks)
// DELETE: Safely delete program

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { programSchema, formatZodErrors } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const program = await prisma.program.findUnique({
      where: { id: params.id },
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found.' }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (err) {
    console.error('[Admin Program GET/id] Error:', err)
    return NextResponse.json({ error: 'Failed to load program.' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const existing = await prisma.program.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Program not found.' }, { status: 404 })
    }

    const body = await req.json()
    const partialSchema = programSchema.partial()
    const result = partialSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    // If slug is changing, ensure uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.program.findUnique({
        where: { slug: data.slug },
      })
      if (slugConflict && slugConflict.id !== params.id) {
        return NextResponse.json(
          { error: 'A program with this slug already exists.' },
          { status: 409 },
        )
      }
    }

    const updated = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })

    revalidatePath('/programs')
    revalidatePath(`/programs/${existing.slug}`)
    if (updated.slug !== existing.slug) {
      revalidatePath(`/programs/${updated.slug}`)
    }
    revalidatePath('/')

    return NextResponse.json({ program: updated })
  } catch (err) {
    console.error('[Admin Program PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update program.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const existing = await prisma.program.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Program not found.' }, { status: 404 })
    }

    await prisma.program.delete({
      where: { id: params.id },
    })

    revalidatePath('/programs')
    revalidatePath(`/programs/${existing.slug}`)
    revalidatePath('/')

    return NextResponse.json({ success: true, id: params.id })
  } catch (err) {
    console.error('[Admin Program DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete program.' }, { status: 500 })
  }
}
