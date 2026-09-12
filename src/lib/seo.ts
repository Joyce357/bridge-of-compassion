// ─── SEO Utilities ────────────────────────────────────────────────────────────
// Canonical URL and base URL helpers for all SEO metadata.
//
// Production: set NEXT_PUBLIC_SITE_URL in your hosting environment (e.g. Vercel).
// Development: falls back to http://localhost:3000.
//
// ⚠ IMPORTANT: If NEXT_PUBLIC_SITE_URL is absent in production, canonical URLs
// will resolve to localhost which is incorrect. Configure the env variable before
// going live.

/**
 * Returns the configured public base URL.
 * Never silently falls back to an unverified production domain.
 */
export function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    // Strip trailing slash for consistent URL building
    return siteUrl.replace(/\/$/, '')
  }
  // Development fallback only
  return 'http://localhost:3000'
}

/**
 * Returns a full canonical URL for a given absolute path.
 * @param path - Must start with '/' (e.g. '/programs', '/events/123')
 */
export function getCanonicalUrl(path: string): string {
  const base = getBaseUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
