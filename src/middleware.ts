// ─── Next.js Middleware ───────────────────────────────────────────────────
// Protects all /admin/* and /api/admin/* routes.
// Redirects unauthenticated users to /admin/login.

import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Allow public access to /admin/login
      if (req.nextUrl.pathname.startsWith('/admin/login')) {
        return true
      }
      // Require JWT token for all other matched admin routes
      return !!token
    },
  },
  pages: {
    signIn: '/admin/login',
  },
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
