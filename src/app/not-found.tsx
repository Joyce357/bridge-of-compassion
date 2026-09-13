// ─── 404 Not Found Page ───────────────────────────────────────────────────────
// Branded 404 consistent with design system. No metadata export needed —
// Next.js handles the status code and this page uses the root layout.

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-warm-white dark:bg-dark-bg flex items-center justify-center px-4 py-20 transition-colors duration-200">
      <div className="max-w-lg w-full text-center">

        {/* Large decorative 404 */}
        <p className="text-[7rem] sm:text-[9rem] leading-none font-extrabold text-brand-sage dark:text-dark-border select-none" aria-hidden="true">
          404
        </p>

        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-brand-navy dark:text-dark-text-primary">
          Page not found
        </h1>
        <p className="mt-3 text-base text-text-secondary dark:text-dark-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand-navy dark:bg-brand-cyan text-white dark:text-brand-navy-dark text-sm font-semibold hover:bg-brand-navy-dark dark:hover:bg-brand-cyan/90 transition-colors shadow-sm"
          >
            Home
          </Link>
          <Link
            href="/programs"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text-primary text-sm font-semibold border border-border-soft dark:border-dark-border hover:bg-brand-cream dark:hover:bg-dark-card-hover transition-colors shadow-sm"
          >
            Programs
          </Link>
          <Link
            href="/get-involved"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text-primary text-sm font-semibold border border-border-soft dark:border-dark-border hover:bg-brand-cream dark:hover:bg-dark-card-hover transition-colors shadow-sm"
          >
            Get Involved
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text-primary text-sm font-semibold border border-border-soft dark:border-dark-border hover:bg-brand-cream dark:hover:bg-dark-card-hover transition-colors shadow-sm"
          >
            Contact
          </Link>
        </div>

      </div>
    </div>
  )
}
