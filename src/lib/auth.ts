// ─── NextAuth Configuration ───────────────────────────────────────────────
// Credentials provider with bcrypt password verification.
// Sessions use JWT strategy with 8-hour expiry.

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) {
          // Perform a dummy compare to prevent timing attacks
          await bcrypt.compare(credentials.password, '$2b$12$dummy.hash.to.prevent.timing.attack')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.name ?? undefined,
          image: user.avatarUrl ?? undefined,
          role:  user.role,
        }
      },
    }),
  ],

  pages: {
    signIn: '/admin/login',
    error:  '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60, // 8 hours
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { id: string; role: string }).role
        token.picture = (user as { image?: string | null }).image ?? null
      }
      if (trigger === 'update' && session?.image !== undefined) {
        token.picture = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.image = (token.picture as string) ?? null
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
