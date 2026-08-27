// ─── PATCH /api/admin/settings ────────────────────────────────────────────
// Update admin profile name/email and/or change password.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import {
  updateProfileSchema,
  changePasswordSchema,
  formatZodErrors,
} from '@/lib/validations'
import bcrypt from 'bcryptjs'

// ── PATCH: update profile (name + email) ─────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    const body = await req.json()

    // ── Change password ────────────────────────────────────────────────────
    if ('currentPassword' in body) {
      const result = changePasswordSchema.safeParse(body)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed.', fields: formatZodErrors(result.error) },
          { status: 422 },
        )
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 })
      }

      const isValid = await bcrypt.compare(result.data.currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
      }

      const hashed = await bcrypt.hash(result.data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data:  { password: hashed },
      })

      return NextResponse.json({ success: true, message: 'Password updated.' })
    }

    // ── Update profile ─────────────────────────────────────────────────────
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    // Check email uniqueness if changed
    if (result.data.email !== session.user.email) {
      const exists = await prisma.user.findUnique({ where: { email: result.data.email } })
      if (exists) {
        return NextResponse.json(
          { error: 'That email address is already in use.' },
          { status: 409 },
        )
      }
    }

    const user = await prisma.user.update({
      where:  { id: session.user.id },
      data:   { name: result.data.name, email: result.data.email },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error('[Admin Settings PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
  }
}
