// ─── Admin: Programs ───────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProgramsManager from '@/components/admin/ProgramsManager'
import type { Metadata } from 'next'
import type { Program } from '@/types'

export const metadata: Metadata = { title: 'Programs' }

export default async function AdminProgramsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  // PostgreSQL is authoritative. No fallback to static data.
  // If the database is unavailable, we surface an honest empty state.
  let programs: Program[] = []
  let total = 0
  let dbError = false

  try {
    const [dbPrograms, count] = await Promise.all([
      prisma.program.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      }),
      prisma.program.count(),
    ])
    programs = dbPrograms as Program[]
    total = count
  } catch (err) {
    console.error('[Admin Programs Page] DB query failed:', (err as Error)?.message)
    dbError = true
  }

  if (dbError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold mb-2">Database unavailable</p>
        <p className="text-sm text-gray-500">
          Could not connect to the database. Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <ProgramsManager
      initialPrograms={programs}
      totalCount={total}
    />
  )
}
