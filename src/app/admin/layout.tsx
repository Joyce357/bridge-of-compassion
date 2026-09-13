// ─── Root Admin Layout ────────────────────────────────────────────────────────
// Wraps ALL /admin/* routes — including /admin/login — to enforce noindex.
// The (dashboard) sub-group also has its own metadata, but this root layout
// ensures /admin/login is never indexed.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
