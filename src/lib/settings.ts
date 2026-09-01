// ─── Site Settings Helper ───────────────────────────────────────────────────
// Centralized server helper for retrieving global site and organization configuration.
// Uses React cache() for request-scoped deduplication across server components.

import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { SiteSettingsRecord } from '@/types'

export const DEFAULT_SITE_SETTINGS: SiteSettingsRecord = {
  id:                    'site',
  organizationName:      'Bridge of Compassion',
  publicEmail:           'admin.bridgeofcompassion@gmail.com',
  phone:                 null,

  addressLine1:          null,
  addressLine2:          null,
  city:                  'Toronto',
  province:              'Ontario',
  postalCode:            null,
  country:               'Canada',
  publicLocationLabel:   'Toronto, Ontario',

  // Social (null/empty = not rendered publicly)
  facebookUrl:           null,
  instagramUrl:          null,
  linkedinUrl:           null,
  youtubeUrl:            null,

  // Site & Content
  footerTagline:         'Nurturing children, protecting nature, and building futures through hands-on environmental education and community action.',
  defaultCurrency:       'CAD',
  donationPresetAmounts: [25, 50, 100, 250, 500],

  // SEO
  seoTitle:              'Bridge of Compassion — Building Bridges, Changing Lives',
  seoDescription:        'Bridge of Compassion is a nonprofit organization dedicated to fostering compassion, strengthening communities, and protecting the natural world. Volunteer, donate, and get involved.',
}

/**
 * Fetch the singleton site settings record from Neon DB.
 * If not present, creates it with defaults and returns it.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsRecord> => {
  try {
    const existing = await prisma.siteSettings.findUnique({
      where: { id: 'site' },
    })

    if (existing) {
      return {
        id:                    existing.id,
        organizationName:      existing.organizationName,
        publicEmail:           existing.publicEmail,
        phone:                 existing.phone,
        addressLine1:          existing.addressLine1,
        addressLine2:          existing.addressLine2,
        city:                  existing.city,
        province:              existing.province,
        postalCode:            existing.postalCode,
        country:               existing.country,
        publicLocationLabel:   existing.publicLocationLabel,
        facebookUrl:           existing.facebookUrl,
        instagramUrl:          existing.instagramUrl,
        linkedinUrl:           existing.linkedinUrl,
        youtubeUrl:            existing.youtubeUrl,
        footerTagline:         existing.footerTagline,
        defaultCurrency:       existing.defaultCurrency,
        donationPresetAmounts: existing.donationPresetAmounts.length > 0
          ? existing.donationPresetAmounts
          : [25, 50, 100, 250, 500],
        seoTitle:              existing.seoTitle,
        seoDescription:        existing.seoDescription,
        createdAt:             existing.createdAt.toISOString(),
        updatedAt:             existing.updatedAt.toISOString(),
      }
    }

    // Seed singleton row if not found
    const created = await prisma.siteSettings.upsert({
      where: { id: 'site' },
      update: {},
      create: {
        id:                    'site',
        organizationName:      DEFAULT_SITE_SETTINGS.organizationName,
        publicEmail:           DEFAULT_SITE_SETTINGS.publicEmail,
        phone:                 DEFAULT_SITE_SETTINGS.phone,
        addressLine1:          DEFAULT_SITE_SETTINGS.addressLine1,
        addressLine2:          DEFAULT_SITE_SETTINGS.addressLine2,
        city:                  DEFAULT_SITE_SETTINGS.city,
        province:              DEFAULT_SITE_SETTINGS.province,
        postalCode:            DEFAULT_SITE_SETTINGS.postalCode,
        country:               DEFAULT_SITE_SETTINGS.country,
        publicLocationLabel:   DEFAULT_SITE_SETTINGS.publicLocationLabel,
        facebookUrl:           DEFAULT_SITE_SETTINGS.facebookUrl,
        instagramUrl:          DEFAULT_SITE_SETTINGS.instagramUrl,
        linkedinUrl:           DEFAULT_SITE_SETTINGS.linkedinUrl,
        youtubeUrl:            DEFAULT_SITE_SETTINGS.youtubeUrl,
        footerTagline:         DEFAULT_SITE_SETTINGS.footerTagline,
        defaultCurrency:       DEFAULT_SITE_SETTINGS.defaultCurrency,
        donationPresetAmounts: DEFAULT_SITE_SETTINGS.donationPresetAmounts,
        seoTitle:              DEFAULT_SITE_SETTINGS.seoTitle,
        seoDescription:        DEFAULT_SITE_SETTINGS.seoDescription,
      },
    })

    return {
      id:                    created.id,
      organizationName:      created.organizationName,
      publicEmail:           created.publicEmail,
      phone:                 created.phone,
      addressLine1:          created.addressLine1,
      addressLine2:          created.addressLine2,
      city:                  created.city,
      province:              created.province,
      postalCode:            created.postalCode,
      country:               created.country,
      publicLocationLabel:   created.publicLocationLabel,
      facebookUrl:           created.facebookUrl,
      instagramUrl:          created.instagramUrl,
      linkedinUrl:           created.linkedinUrl,
      youtubeUrl:            created.youtubeUrl,
      footerTagline:         created.footerTagline,
      defaultCurrency:       created.defaultCurrency,
      donationPresetAmounts: created.donationPresetAmounts,
      seoTitle:              created.seoTitle,
      seoDescription:        created.seoDescription,
      createdAt:             created.createdAt.toISOString(),
      updatedAt:             created.updatedAt.toISOString(),
    }
  } catch (err) {
    console.error('[SiteSettings] Failed to fetch settings from database, using defaults:', err)
    return DEFAULT_SITE_SETTINGS
  }
})
