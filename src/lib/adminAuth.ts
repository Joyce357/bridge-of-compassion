// ─── Admin Auth Helper ────────────────────────────────────────────────────
// Every protected admin API endpoint must call requireAdminSession()
// independently — do not rely solely on middleware.

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

export interface AdminSession {
  user: {
    id:    string
    email: string
    name?: string | null
    role:  string
  }
}

/**
 * Verifies that the incoming request has a valid admin session.
 * Returns { session } on success, or { error } (a 401 NextResponse) on failure.
 *
 * Usage in API routes:
 *   const { session, error } = await requireAdminSession()
 *   if (error) return error
 */
export async function requireAdminSession(): Promise<
  | { session: AdminSession; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 },
      ),
    }
  }

  return { session: session as AdminSession, error: null }
}

/**
 * Standard error response helper to avoid leaking internal details.
 */
export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}
