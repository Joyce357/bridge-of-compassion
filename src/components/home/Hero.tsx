import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section
      className="relative bg-gradient-to-b from-brand-cream/70 via-brand-cream to-brand-cream/90 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg overflow-hidden transition-colors duration-200"
      aria-labelledby="hero-heading"
    >
      {/* ── Subtle background organic accent ──────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-25 dark:opacity-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 80% 20%, #DCEFF6 0%, #DDE8D2 40%, transparent 70%)',
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="container-boc relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-6 sm:pt-8 md:pt-9 lg:pt-10 pb-6 sm:pb-8 lg:pb-10">

          {/* ── Left: Text content (7 cols on lg) ───────────────────────── */}
          <div className="lg:col-span-7 max-w-2xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2.5 animate-fade-in">
              <div className="w-2 h-3.5 bg-brand-green dark:bg-brand-cyan rounded-full shrink-0" aria-hidden="true" />
              <span className="text-brand-green dark:text-brand-cyan text-xs sm:text-sm font-bold tracking-widest uppercase">
                Bridge of Compassion
              </span>
            </div>

            {/* Main heading */}
            <h1
              id="hero-heading"
              className="text-brand-navy dark:text-dark-text-primary text-balance text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.14] mb-3 sm:mb-3.5 animate-fade-up tracking-tight"
            >
              Helping Young People Learn, Lead{' '}
              <span className="text-brand-green dark:text-brand-cyan block sm:inline">
                &amp; Care for the Planet.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base md:text-lg leading-relaxed mb-4.5 sm:mb-5 max-w-xl animate-fade-up animate-delay-100">
              We support children and young people through practical environmental
              education, sustainability programs, and hands-on community action—turning
              environmental knowledge into meaningful change.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 animate-fade-up animate-delay-200">
              <Button href="/get-involved" variant="primary" size="lg" className="shadow-sm">
                Get Involved
              </Button>
              <Button href="/programs" variant="secondary" size="lg">
                Explore Our Programs
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-5 pt-3.5 border-t border-border-soft dark:border-dark-border animate-fade-in animate-delay-300">
              <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-medium">
                <svg className="w-4 h-4 text-brand-green dark:text-brand-cyan shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Environmental education
              </div>
              <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-medium">
                <svg className="w-4 h-4 text-brand-green dark:text-brand-cyan shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Youth leadership
              </div>
              <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-medium">
                <svg className="w-4 h-4 text-brand-green dark:text-brand-cyan shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Community action
              </div>
            </div>

          </div>

          {/* ── Right: Hero Image Frame (5 cols on lg) ──────────────────── */}
          <div className="lg:col-span-5 relative animate-fade-in animate-delay-100">

            {/* Main photo frame */}
            <div className="relative aspect-[4/3] sm:aspect-[14/11] lg:aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden shadow-card-hover border border-border-soft dark:border-dark-border bg-brand-cream dark:bg-dark-surface">
              <Image
                src="/images/hero-youth-nature.jpg"
                alt="Young people participating in tree planting and outdoor environmental education"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />

              {/* Gentle bottom-up subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/30 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>

            {/* Decorative leaf flourish accent */}
            <div className="absolute -bottom-3 -right-3 w-12 h-12 sm:w-14 sm:h-14 bg-brand-warm-white dark:bg-dark-surface rounded-full p-2.5 shadow-md border border-border-soft dark:border-dark-border flex items-center justify-center pointer-events-none">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-brand-green dark:text-brand-cyan" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17.5 9.5 13 17 11V8m0-6C9.5 2 4 7.5 4 15c0 .35.03.69.07 1.03C5.9 11.83 9.5 8 17 6V2z" />
              </svg>
            </div>

            {/* Subtle floating badge */}
            <div className="absolute -top-2.5 -left-2.5 bg-brand-warm-white dark:bg-dark-surface border border-brand-green/30 dark:border-brand-cyan/30 text-brand-navy dark:text-dark-text-primary px-3.5 py-1.5 rounded-xl shadow-sm hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green dark:bg-brand-cyan animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green dark:text-brand-cyan">Hands-On Learning</span>
            </div>

          </div>
        </div>
      </div>
    </section>

  )
}
