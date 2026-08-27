// ─── News Page ────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { stories as seedStories } from '@/data/stories'

export const metadata: Metadata = {
  title: 'News & Stories',
  description: 'Read the latest news, stories, and updates from Bridge of Compassion.',
  alternates: { canonical: 'https://bridgeofcompassion.org/news' },
}

async function getNewsPosts() {
  try {
    return await prisma.newsPost.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id:           true,
        title:        true,
        slug:         true,
        excerpt:      true,
        featuredImage: true,
        author:       true,
        publishedAt:  true,
      },
    })
  } catch {
    return []
  }
}

function formatDate(date: Date | string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function NewsPage() {
  const dbPosts = await getNewsPosts()
  const hasDatabasePosts = dbPosts.length > 0

  return (
    <>
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-boc text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">Latest Updates</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">News &amp; Stories</h1>
          <p className="text-brand-warm-white/80 text-lg max-w-xl mx-auto">
            Stories of impact, community updates, and the voices behind our environmental work.
          </p>
        </div>
      </section>

      <section className="section-py bg-brand-warm-white">
        <div className="container-boc">
          {!hasDatabasePosts && (
            <div className="mb-8 bg-brand-sky/40 border border-brand-cyan/20 rounded-xl px-5 py-4 text-sm text-brand-navy">
              <strong>Development note:</strong> Showing placeholder stories. Seed the database or add posts via the admin to show real content.
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!hasDatabasePosts
              ? seedStories.map((story) => (
                  <article key={story.id} className="card group bg-brand-warm-white border border-border-soft hover:border-brand-green/40 hover:shadow-card-hover">
                    <div className="img-placeholder aspect-card flex items-center justify-center text-5xl bg-brand-sage/30">
                      📰
                    </div>
                    <div className="p-6">
                      <span className="eyebrow text-xs">{story.category}</span>
                      <h2 className="text-lg font-bold text-brand-navy mt-2 mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
                        <a href={story.href}>{story.title}</a>
                      </h2>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">{story.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{formatDate(story.date)}</span>
                        <span>{story.readTime}</span>
                      </div>
                    </div>
                  </article>
                ))
              : dbPosts.map((post) => (
                  <article key={post.id} className="card group bg-brand-warm-white border border-border-soft hover:border-brand-green/40 hover:shadow-card-hover">
                    <div className="img-placeholder aspect-card flex items-center justify-center text-5xl bg-brand-sage/30">
                      📰
                    </div>
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
                        <a href={`/news/${post.slug}`}>{post.title}</a>
                      </h2>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{formatDate(post.publishedAt)}</span>
                        {post.author && <span>By {post.author}</span>}
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </section>
    </>
  )
}
