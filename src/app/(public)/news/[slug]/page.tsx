// ─── News Post Detail Page ────────────────────────────────────────────────
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await prisma.newsPost.findFirst({
      where:  { slug: params.slug, published: true },
      select: { title: true, excerpt: true },
    })
    if (!post) return { title: 'Post Not Found' }
    return {
      title:       post.title,
      description: post.excerpt,
    }
  } catch {
    return { title: 'News' }
  }
}

export default async function NewsPostPage({ params }: Props) {
  let post
  try {
    post = await prisma.newsPost.findFirst({
      where: { slug: params.slug, published: true },
    })
  } catch {
    notFound()
  }

  if (!post) notFound()

  return (
    <>
      <section className="bg-gradient-hero section-py-sm">
        <div className="container-boc max-w-3xl">
          <a href="/news" className="text-white/60 hover:text-white text-sm mb-6 inline-flex items-center gap-1">
            ← Back to News
          </a>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 text-balance">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
            {post.author && <span>By {post.author}</span>}
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-CA', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section-py bg-clean-white">
        <div className="container-boc max-w-3xl">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 prose-boc">
            <p className="text-lg text-ink-muted mb-8 font-medium leading-relaxed border-l-4 border-moss pl-5">
              {post.excerpt}
            </p>
            <div className="whitespace-pre-wrap text-ink-muted leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
