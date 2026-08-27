// ─── Prisma CLI Configuration (Prisma 7) ─────────────────────────────────────
// Prisma 7 requires connection URLs in prisma.config.ts, NOT in schema.prisma.
//
// For Neon with a connection pooler:
//   - prisma.config.ts  → uses DIRECT_URL (non-pooled) for CLI and migrations
//   - src/lib/prisma.ts → uses DATABASE_URL (pooled) via pg.Pool + PrismaPg adapter
//
// DIRECT_URL is needed because Neon's pooler (PgBouncer-compatible) does not
// support the SET commands and transaction DDL that Prisma Migrate requires.
//
// SECURITY: These values come from environment variables loaded from .env.local.
// Never hardcode credentials. .env.local is git-ignored.

import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Prisma CLI does not auto-load .env.local (only Next.js does).
// We explicitly load .env.local so DIRECT_URL and DATABASE_URL are available.
config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations and CLI use the DIRECT_URL (non-pooled Neon connection).
    // This bypasses PgBouncer so Prisma Migrate can run DDL without transaction issues.
    url: env('DIRECT_URL'),
  },
})
