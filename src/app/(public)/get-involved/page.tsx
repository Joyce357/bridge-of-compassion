// ─── Get Involved Landing Page ───────────────────────────────────────────
import type { Metadata } from 'next'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Get Involved | Volunteer & Support',
  description:
    'Discover how you can get involved with Bridge of Compassion through volunteering, donations, and community partnerships for environmental action.',
  alternates: { canonical: 'https://bridgeofcompassion.org/get-involved' },
}

export default function GetInvolvedPage() {
  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="bg-brand-navy-dark dark:bg-dark-bg section-py text-brand-warm-white relative overflow-hidden transition-colors duration-200">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <Container className="text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-3">Join Our Mission</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 text-balance tracking-tight">
            Get Involved with Bridge of Compassion
          </h1>
          <p className="text-brand-warm-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you give your time as a volunteer, support our programs with a donation,
            or partner with us on local initiatives—you help young people connect with nature
            and lead real environmental change.
          </p>
        </Container>
      </section>

      {/* ── Main Participation Pathways ──────────────────────────────────── */}
      <section className="section-py bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="eyebrow block mb-2">Ways to Participate</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight mb-3">
              Find the Path That Fits You
            </h2>
            <div className="divider-green mx-auto mb-3" />
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed">
              Every action counts. Explore the different ways you can support youth leadership
              and ecological stewardship in our community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Pathway 1: Volunteer */}
            <div className="card flex flex-col p-6 sm:p-7 justify-between border-border-soft dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sage/40 dark:bg-dark-surface text-brand-green dark:text-brand-cyan flex items-center justify-center text-2xl mb-4 shadow-2xs">
                  🤝
                </div>
                <h3 className="text-xl font-bold text-brand-navy dark:text-dark-text-primary mb-2">Volunteer With Us</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  Join our hands-on volunteer days including native tree planting, park and ravine
                  cleanups, and youth outdoor learning workshops. Open to youth and adults.
                </p>
              </div>

              <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-2">
                <Button href="/volunteer" variant="primary" className="w-full justify-center text-xs sm:text-sm">
                  Apply to Volunteer
                </Button>
                <p className="text-[11px] text-center text-text-secondary dark:text-dark-text-secondary">
                  Flexible hours: weekdays, weekends, and events
                </p>
              </div>
            </div>

            {/* Pathway 2: Donate */}
            <div className="card flex flex-col p-6 sm:p-7 justify-between border-border-soft dark:border-dark-border hover:border-accent-pink/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-accent-pink flex items-center justify-center text-2xl mb-4 shadow-2xs">
                  💚
                </div>
                <h3 className="text-xl font-bold text-brand-navy dark:text-dark-text-primary mb-2">Make a Donation</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  Your financial gift directly funds student workshop materials, native seedlings,
                  field equipment, and accessible outdoor education programs for youth.
                </p>
              </div>

              <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-2">
                <Button href="/donate" variant="environmental" className="w-full justify-center text-xs sm:text-sm">
                  Support Our Mission
                </Button>
                <p className="text-[11px] text-center text-text-secondary dark:text-dark-text-secondary">
                  One-time gifts with instant payment confirmation
                </p>
              </div>
            </div>

            {/* Pathway 3: Partner & Inquire */}
            <div id="partner" className="card flex flex-col p-6 sm:p-7 justify-between border-border-soft dark:border-dark-border hover:border-brand-cyan/40 scroll-mt-24">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sky dark:bg-dark-surface text-brand-cyan flex items-center justify-center text-2xl mb-4 shadow-2xs">
                  🌿
                </div>
                <h3 className="text-xl font-bold text-brand-navy dark:text-dark-text-primary mb-2">Partner With Us</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  We collaborate with local schools, community organizations, and environmental groups
                  to co-create impactful workshops, cleanup days, and youth leadership initiatives.
                </p>
              </div>

              <div className="pt-4 border-t border-border-soft dark:border-dark-border space-y-2">
                <Button href="/contact" variant="secondary" className="w-full justify-center text-xs sm:text-sm">
                  Explore Partnerships
                </Button>
                <p className="text-[11px] text-center text-text-secondary dark:text-dark-text-secondary">
                  Reach out directly to discuss community collaboration
                </p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ── Why Your Involvement Matters ─────────────────────────────────── */}
      <section className="section-py bg-brand-cream dark:bg-dark-surface border-t border-border-soft/60 dark:border-dark-border transition-colors duration-200">
        <Container>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-5">
              <span className="eyebrow block mb-2">Community Impact</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-dark-text-primary tracking-tight mb-3">
                Why Getting Involved Matters
              </h2>
              <div className="divider-green mb-4" />
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed mb-4">
                At Bridge of Compassion, community participation is at the heart of everything we do.
                When we empower young people with ecological knowledge and practical tools, we nurture
                lifelong stewards for our planet.
              </p>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed">
                Whether you join us for a single afternoon cleanup or support our programs regularly,
                your involvement creates tangible, positive change.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  icon: '🌱',
                  title: 'Hands-On Nature Education',
                  desc: 'Children and young people learn through direct exploration in parks, ravines, and community gardens.',
                },
                {
                  icon: '🌳',
                  title: 'Native Habitat Restoration',
                  desc: 'Tree planting and stewardship efforts directly strengthen urban biodiversity and canopy cover.',
                },
                {
                  icon: '🤝',
                  title: 'Youth Leadership & Teamwork',
                  desc: 'Participants gain confidence, problem-solving abilities, and collaborative leadership skills.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 bg-brand-warm-white dark:bg-dark-card rounded-2xl p-4 sm:p-5 border border-border-soft dark:border-dark-border shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-sage/40 dark:bg-dark-surface flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy dark:text-dark-text-primary text-sm sm:text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Container>
      </section>

      {/* ── Questions & Contact Banner ───────────────────────────────────── */}
      <section className="section-py-sm bg-brand-sky/40 dark:bg-dark-surface border-t border-brand-sky/70 dark:border-dark-border transition-colors duration-200">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-brand-navy dark:text-dark-text-primary mb-0.5">
                Have questions about getting involved?
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary">
                Our team is always happy to answer questions or help you find the right opportunity.
              </p>
            </div>
            <Link
              href="/contact"
              className="btn-secondary whitespace-nowrap text-xs sm:text-sm px-5 py-2.5"
            >
              Contact Us →
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
