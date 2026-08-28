// ─── News Post Detail Page ────────────────────────────────────────────────
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Container from '@/components/ui/Container'
import { getPublishedNewsBySlug, getNewsCategoryStyle } from '@/lib/news'
import { formatDate } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedNewsBySlug(params.slug)
  if (!post) return { title: 'Story Not Found — Bridge of Compassion' }

  return {
    title: `${post.title} — Bridge of Compassion`,
    description: post.excerpt || `Read ${post.title} on Bridge of Compassion.`,
    alternates: {
      canonical: `https://bridgeofcompassion.org/news/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
    },
  }
}

export default async function NewsPostPage({ params }: Props) {
  const post = await getPublishedNewsBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const catStyle = getNewsCategoryStyle(post.category)
  const dateStr = post.publishedAt || post.createdAt

  return (
    <article className="min-h-screen bg-brand-warm-white pb-20">
      {/* Hero Header */}
      <section className="bg-brand-navy-dark text-brand-warm-white relative overflow-hidden py-12 sm:py-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />

        <Container className="max-w-4xl relative z-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan hover:text-white transition-colors mb-6 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to all stories</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.category && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs bg-white/95 ${catStyle.text} ${catStyle.border}`}
              >
                {post.category}
              </span>
            )}
            {post.featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950">
                ★ Featured Story
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-brand-warm-white/80 border-t border-white/10 pt-4">
            {post.author && (
              <div className="flex items-center gap-2">
                <span className="text-brand-cyan font-bold">Author:</span>
                <span className="font-semibold text-white">{post.author}</span>
              </div>
            )}
            {dateStr && (
              <div className="flex items-center gap-2">
                <span className="text-brand-cyan font-bold">Published:</span>
                <time dateTime={typeof dateStr === 'string' ? dateStr : dateStr.toISOString()}>
                  {formatDate(dateStr)}
                </time>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="max-w-4xl -mt-6 relative z-20">
        <div className="bg-white rounded-3xl border border-border-soft shadow-xs p-6 sm:p-10 md:p-12 space-y-8">
          {/* Hero Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border-soft shadow-2xs">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt Lead */}
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-brand-navy font-semibold leading-relaxed border-l-4 border-brand-green pl-5 py-1 bg-brand-cream/30 rounded-r-xl">
              {post.excerpt}
            </p>
          )}

          {/* Body Content */}
          <div className="text-text-primary text-base sm:text-lg leading-relaxed whitespace-pre-wrap space-y-4">
            {post.content}
          </div>

          {/* Back link & Footer CTA */}
          <div className="border-t border-border-soft/60 pt-8 mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy hover:text-brand-green transition-colors"
            >
              <span>← Back to all stories</span>
            </Link>

            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-colors shadow-xs"
            >
              Join Our Community Mission
            </Link>
          </div>
        </div>
      </Container>
    </article>
  )
}
