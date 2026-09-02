import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'
import { getFeaturedNews, getNewsCategoryStyle } from '@/lib/news'
import { formatDate } from '@/lib/utils'

export default async function StoriesPreview() {
  const featured = await getFeaturedNews(3)

  return (
    <section className="section-py bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200" aria-labelledby="stories-heading">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <SectionHeading
            eyebrow="News &amp; Stories"
            title="Stories of Environmental Impact"
            subtitle="Real stories from young people, volunteers, and the ecosystems we are privileged to protect."
            id="stories-heading"
          />
          <Button href="/news" variant="secondary" size="md" className="shrink-0">
            View All Stories
          </Button>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-dark-card rounded-3xl border border-border-soft dark:border-dark-border shadow-xs max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-brand-sage/40 dark:bg-dark-surface flex items-center justify-center text-2xl mx-auto mb-3">
              📰
            </div>
            <h3 className="text-base font-bold text-brand-navy dark:text-dark-text-primary mb-1.5">New Stories Coming Soon</h3>
            <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
              We are documenting our latest youth mentorship outcomes and community restoration milestones.
            </p>
            <Button href="/news" variant="primary" size="sm">
              Explore News &amp; Updates
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featured.map((story) => {
              const catStyle = getNewsCategoryStyle(story.category)
              const dateStr = story.publishedAt || story.createdAt

              return (
                <Link
                  key={story.id}
                  href={`/news/${story.slug}`}
                  className="group card flex flex-col focus-visible:ring-2 focus-visible:ring-brand-navy dark:focus-visible:ring-brand-cyan bg-white dark:bg-dark-card border border-border-soft dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40 hover:shadow-card-hover rounded-2xl overflow-hidden transition-all duration-200"
                  aria-label={`Read: ${story.title}`}
                >
                  {/* Image container */}
                  <div className="aspect-[16/9] relative overflow-hidden bg-brand-cream/60 dark:bg-dark-surface border-b border-border-soft/60 dark:border-dark-border">
                    {story.featuredImage ? (
                      <Image
                        src={story.featuredImage}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-brand-green/30 dark:text-brand-cyan/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}

                    {/* Category badge */}
                    {story.category && (
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-xs bg-white/95 dark:bg-dark-surface/95 ${catStyle.text} ${catStyle.border} shadow-2xs`}
                        >
                          {story.category}
                        </span>
                      </div>
                    )}

                    {/* Featured badge */}
                    {story.featured && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-xs">
                          ★ Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    {dateStr && (
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-dark-text-secondary text-xs font-medium">
                        <time dateTime={typeof dateStr === 'string' ? dateStr : dateStr.toISOString()}>
                          {formatDate(dateStr)}
                        </time>
                        {story.author && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{story.author}</span>
                          </>
                        )}
                      </div>
                    )}

                    <h3 className="text-brand-navy dark:text-dark-text-primary text-base font-bold leading-snug mb-2 group-hover:text-brand-green dark:group-hover:text-brand-cyan transition-colors duration-200 line-clamp-2">
                      {story.title}
                    </h3>

                    {story.excerpt && (
                      <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                        {story.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-brand-green dark:text-brand-cyan text-xs sm:text-sm font-bold group-hover:text-brand-navy dark:group-hover:text-dark-text-primary transition-colors duration-200 mt-auto pt-1">
                      <span>Read Story</span>
                      <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
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

  )
}
