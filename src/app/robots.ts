// ─── robots.ts ────────────────────────────────────────────────────────────────
// Controls crawler access to Bridge of Compassion routes.
// Public routes are allowed; all admin and API routes are disallowed.
// Sitemap URL is included only when NEXT_PUBLIC_SITE_URL is configured (not localhost).

import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const isProduction = baseUrl !== 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    // Only include sitemap when production URL is configured
    ...(isProduction ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  }
}
