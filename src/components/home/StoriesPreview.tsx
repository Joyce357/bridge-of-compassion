import Link from 'next/link'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { stories } from '@/data/stories'
import { formatDate } from '@/lib/utils'

export default function StoriesPreview() {
  const featured = stories.slice(0, 3)

  return (
    <section className="section-py bg-brand-warm-white" aria-labelledby="stories-heading">
      <Container>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featured.map((story) => (
            <Link
              key={story.id}
              href={story.href}
              className="group card flex flex-col focus-visible:ring-2 focus-visible:ring-brand-navy bg-brand-warm-white border border-border-soft hover:border-brand-green/40 hover:shadow-card-hover"
              aria-label={`Read: ${story.title}`}
            >
              {/* Image placeholder */}
              <div className="aspect-[16/9] img-placeholder relative overflow-hidden bg-brand-sage/30">
                <div className="absolute inset-0 flex items-center justify-center text-brand-green/30">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Category badge */}
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="cyan">{story.category}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-1.5 text-text-secondary text-xs font-medium">
                  <time dateTime={story.date}>{formatDate(story.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{story.readTime}</span>
                </div>

                <h3 className="text-brand-navy text-sm sm:text-base font-bold leading-snug mb-2 group-hover:text-brand-green transition-colors duration-200">
                  {story.title}
                </h3>

                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed flex-1 mb-4">
                  {story.excerpt}
                </p>

                <div className="flex items-center gap-1.5 text-brand-green text-xs sm:text-sm font-bold group-hover:text-brand-navy transition-colors duration-200">
                  Read Story
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </Container>
    </section>
  )
}
