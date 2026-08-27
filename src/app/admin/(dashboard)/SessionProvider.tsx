'use client'
// ─── NextAuth SessionProvider for Admin ───────────────────────────────────
// Wraps admin pages in the NextAuth session context for client components.

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

export default function SessionProvider({
  children,
  session,
}: {
  children:  React.ReactNode
  session:   Session | null
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
