// ─── /api/admin/settings ──────────────────────────────────────────────────
// GET: Retrieve global SiteSettings.
// PATCH: Update SiteSettings, Admin Profile, or Admin Password.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import {
  siteSettingsSchema,
  updateProfileSchema,
  changePasswordSchema,
  formatZodErrors,
} from '@/lib/validations'
import { getSiteSettings } from '@/lib/settings'
import bcrypt from 'bcryptjs'

// ── GET: Fetch site settings ──────────────────────────────────────────────────

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ success: true, settings })
  } catch (err) {
    console.error('[Admin Settings GET] Error:', err)
    return NextResponse.json({ error: 'Failed to load site settings.' }, { status: 500 })
  }
}

// ── PATCH: Update site settings or admin profile/password ─────────────────────

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>

    // ── 1. Change password ────────────────────────────────────────────────────
    if ('currentPassword' in payload) {
      const result = changePasswordSchema.safeParse(payload)
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

      return NextResponse.json({ success: true, message: 'Password updated successfully.' })
    }

    // ── 2. Update admin account profile ───────────────────────────────────────
    if (payload.isProfileUpdate || ('name' in payload && 'email' in payload && !('organizationName' in payload))) {
      const result = updateProfileSchema.safeParse(payload)
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
    }

    // ── 3. Update global site settings ────────────────────────────────────────
    const result = siteSettingsSchema.safeParse(payload)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed.', fields: formatZodErrors(result.error) },
        { status: 422 },
      )
    }

    const data = result.data

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'site' },
      update: {
        organizationName:      data.organizationName,
        publicEmail:           data.publicEmail,
        phone:                 data.phone || null,
        addressLine1:          data.addressLine1 || null,
        addressLine2:          data.addressLine2 || null,
        city:                  data.city || null,
        province:              data.province || null,
        postalCode:            data.postalCode || null,
        country:               data.country || null,
        publicLocationLabel:   data.publicLocationLabel || null,
        facebookUrl:           data.facebookUrl || null,
        instagramUrl:          data.instagramUrl || null,
        linkedinUrl:           data.linkedinUrl || null,
        youtubeUrl:            data.youtubeUrl || null,
        footerTagline:         data.footerTagline || null,
        defaultCurrency:       data.defaultCurrency,
        donationPresetAmounts: data.donationPresetAmounts,
        seoTitle:              data.seoTitle || null,
        seoDescription:        data.seoDescription || null,
      },
      create: {
        id:                    'site',
        organizationName:      data.organizationName,
        publicEmail:           data.publicEmail,
        phone:                 data.phone || null,
        addressLine1:          data.addressLine1 || null,
        addressLine2:          data.addressLine2 || null,
        city:                  data.city || null,
        province:              data.province || null,
        postalCode:            data.postalCode || null,
        country:               data.country || null,
        publicLocationLabel:   data.publicLocationLabel || null,
        facebookUrl:           data.facebookUrl || null,
        instagramUrl:          data.instagramUrl || null,
        linkedinUrl:           data.linkedinUrl || null,
        youtubeUrl:            data.youtubeUrl || null,
        footerTagline:         data.footerTagline || null,
        defaultCurrency:       data.defaultCurrency,
        donationPresetAmounts: data.donationPresetAmounts,
        seoTitle:              data.seoTitle || null,
        seoDescription:        data.seoDescription || null,
      },
    })

    return NextResponse.json({
      success: true,
      settings: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('[Admin Settings PATCH] Error:', err)
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
  }
}
