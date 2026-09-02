// ─── Public Program Detail Page ───────────────────────────────────────────

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { getProgramBySlug, getCategoryAccent } from '@/lib/programs'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const program = await getProgramBySlug(params.slug)
    if (!program) return { title: 'Program Not Found' }
    return {
      title: `${program.title} — Programs`,
      description: program.shortDescription,
    }
  } catch {
    return { title: 'Program Not Found' }
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  let program: Awaited<ReturnType<typeof getProgramBySlug>> = null

  try {
    program = await getProgramBySlug(params.slug)
  } catch (err) {
    console.error('[Program Detail] DB query failed:', (err as Error)?.message)
    notFound()
  }

  if (!program) {
    notFound()
  }

  const accent = getCategoryAccent(program.category)

  return (
    <div className="min-h-screen bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200">
      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="bg-brand-cream/60 dark:bg-dark-surface border-b border-border-soft/60 dark:border-dark-border py-3 sm:py-4 transition-colors duration-200">
        <Container>
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary">
            <Link href="/" className="hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/programs" className="hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors">
              Programs
            </Link>
            <span>/</span>
            <span className="font-semibold text-brand-navy dark:text-dark-text-primary truncate max-w-[200px] sm:max-w-xs">
              {program.title}
            </span>
          </nav>
        </Container>
      </div>

      {/* ── Article Header ───────────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.badgeBorder}`}
              >
                {program.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight mb-4 text-balance">
              {program.title}
            </h1>

            <p className="text-text-secondary dark:text-dark-text-secondary text-base sm:text-lg leading-relaxed font-medium mb-6">
              {program.shortDescription}
            </p>

            <div className="divider-green mb-8" />
          </div>
        </Container>
      </section>

      {/* ── Featured Image & Content ─────────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {program.imageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-card border border-border-soft dark:border-dark-border bg-brand-cream dark:bg-dark-surface">
                <Image
                  src={program.imageUrl}
                  alt={program.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            )}

            {/* Description Body */}
            <div className="prose prose-slate max-w-none text-text-primary dark:text-dark-text-primary text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
              {program.description}
            </div>

            {/* Next Steps & Back Link */}
            <div className="pt-8 border-t border-border-soft dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-navy dark:text-dark-text-primary hover:text-brand-green dark:hover:text-brand-cyan transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to All Programs
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/volunteer"
                  className="px-5 py-2.5 bg-brand-green dark:bg-brand-cyan hover:bg-brand-navy dark:hover:bg-brand-cyan/90 text-white dark:text-brand-navy-dark text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  Volunteer for This Program
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-white dark:bg-dark-card hover:bg-brand-cream dark:hover:bg-dark-card-hover text-brand-navy dark:text-dark-text-primary text-xs sm:text-sm font-bold rounded-xl border border-border-soft dark:border-dark-border shadow-xs transition-colors"
                >
                  Inquire
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
