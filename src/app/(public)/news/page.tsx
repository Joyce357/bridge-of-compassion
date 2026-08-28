// ─── News & Stories Listing Page ──────────────────────────────────────────
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import { getPublishedNews, getNewsCategoryStyle } from '@/lib/news'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'News & Stories',
  description: 'Read the latest environmental impact stories, community updates, and news from Bridge of Compassion.',
  alternates: { canonical: 'https://bridgeofcompassion.org/news' },
}

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const posts = await getPublishedNews()

  return (
    <>
      {/* Hero Header */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <Container className="text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-3">Community &amp; Conservation</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">
            News &amp; Impact Stories
          </h1>
          <p className="text-brand-warm-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Stories of youth leadership, ecosystem restoration, and the community members driving positive environmental change.
          </p>
        </Container>
      </section>

      {/* Main Stories Grid */}
      <section className="section-py bg-brand-warm-white">
        <Container>
          {posts.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-border-soft shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-brand-sage/40 flex items-center justify-center text-3xl mx-auto mb-4">
                📰
              </div>
              <h2 className="text-xl font-extrabold text-brand-navy mb-2">No Stories Published Yet</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                Our team is currently preparing new community updates and impact articles. Please check back soon or join our newsletter to stay informed.
              </p>
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-dark transition-colors shadow-xs"
              >
                Get Involved as a Volunteer
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post) => {
                const catStyle = getNewsCategoryStyle(post.category)
                const dateStr = post.publishedAt || post.createdAt

                return (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="group card flex flex-col bg-white border border-border-soft hover:border-brand-green/40 hover:shadow-card-hover rounded-2xl overflow-hidden transition-all duration-200"
                    aria-label={`Read story: ${post.title}`}
                  >
                    {/* Featured Image or Graphic Placeholder */}
                    <div className="aspect-[16/9] relative overflow-hidden bg-brand-cream/60 border-b border-border-soft/60">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-brand-green/30">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}

                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-xs bg-white/95 ${catStyle.text} ${catStyle.border} shadow-2xs`}
                          >
                            {post.category}
                          </span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {post.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-xs">
                            ★ Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-1 p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary text-xs font-medium">
                        {dateStr && <time dateTime={typeof dateStr === 'string' ? dateStr : dateStr.toISOString()}>{formatDate(dateStr)}</time>}
                        {post.author && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{post.author}</span>
                          </>
                        )}
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-brand-navy leading-snug mb-2.5 group-hover:text-brand-green transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-brand-green text-xs sm:text-sm font-bold group-hover:text-brand-navy transition-colors duration-200 mt-auto pt-2">
                        <span>Read Full Story</span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
