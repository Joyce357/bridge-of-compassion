'use client'

import { useVolunteerModal } from '@/context/VolunteerModalContext'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function VolunteerLanding() {
  const { openVolunteerModal } = useVolunteerModal()

  return (
    <>
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />

        <Container className="text-center relative z-10">
          <span className="eyebrow text-brand-cyan mb-3 block">Get Involved</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-warm-white mb-4 text-balance tracking-tight">
            Volunteer with Bridge of Compassion
          </h1>
          <p className="text-brand-warm-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Your time, talent, and passion help nurture young leaders and protect our natural world.
            Join our dedicated network of community volunteers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={openVolunteerModal}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-green text-brand-warm-white font-bold text-sm sm:text-base hover:bg-brand-green/90 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              Apply to Volunteer
            </button>
            <Button
              href="/about"
              variant="outline-green"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-brand-warm-white border-white/30 hover:bg-white/10 text-sm font-semibold"
            >
              Learn Our Mission
            </Button>
          </div>
        </Container>
      </section>

      {/* ─── Impact Pillars ────────────────────────────────────────────── */}
      <section className="section-py bg-brand-cream/60 border-b border-border-soft/60">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow block mb-2">Why Volunteer</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
              Create Meaningful Change
            </h2>
            <div className="divider-green mx-auto mb-3" />
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Every hour you give directly enriches outdoor learning, preserves local green spaces,
              and inspires the next generation of environmental leaders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🌱',
                title: 'Practical Conservation',
                desc: 'Lead tree planting initiatives, wetland restorations, and cleanup days across local urban and park spaces.',
              },
              {
                icon: '🤝',
                title: 'Youth Mentorship',
                desc: 'Guide young people through experiential outdoor workshops and hands-on environmental leadership programs.',
              },
              {
                icon: '✨',
                title: 'Community Connection',
                desc: 'Collaborate with passionate educators, ecologists, and neighbours who care about social and ecological health.',
              },
              {
                icon: '📚',
                title: 'Skill Development',
                desc: 'Gain real-world experience in project coordination, community outreach, workshop facilitation, and event planning.',
              },
              {
                icon: '⏱️',
                title: 'Flexible Scheduling',
                desc: 'Contribute on weekdays, weekends, or specific seasonal events that match your availability and lifestyle.',
              },
              {
                icon: '🏆',
                title: 'Recognized Contribution',
                desc: 'Receive volunteer hour certificates, letters of recommendation, and community leadership recognition.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-brand-warm-white rounded-2xl p-6 sm:p-7 shadow-card border border-border-soft hover:shadow-card-hover transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-sage/40 text-2xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow block mb-2">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
              How to Get Started
            </h2>
            <div className="divider-green mx-auto mb-3" />
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Joining our team is easy and fast. Here is what you can expect:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Submit Application',
                desc: 'Click "Apply to Volunteer" and share your contact info, areas of interest, and general availability.',
              },
              {
                step: '02',
                title: 'Quick Welcome Call',
                desc: 'Our team will review your application and email you to schedule a brief introductory alignment call.',
              },
              {
                step: '03',
                title: 'Make an Impact',
                desc: 'Attend an orientation session, receive materials, and start participating in upcoming programs and events.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-brand-cream/40 rounded-2xl p-6 sm:p-8 border border-border-soft flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-brand-green/30 block mb-3 font-mono">
                    {s.step}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2">
                    {s.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-12 bg-gradient-to-br from-brand-navy to-brand-navy-dark rounded-3xl p-8 sm:p-12 text-center text-brand-warm-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Join Us?
              </h3>
              <p className="text-brand-warm-white/80 text-sm sm:text-base leading-relaxed">
                Take the first step today. It only takes two minutes to submit your volunteer application.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openVolunteerModal}
                  className="px-8 py-3.5 rounded-xl bg-brand-green text-brand-warm-white font-bold text-sm sm:text-base hover:bg-brand-green/90 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <span>Apply to Volunteer</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
