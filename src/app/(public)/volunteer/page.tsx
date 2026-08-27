// ─── Volunteer Page ───────────────────────────────────────────────────────
import type { Metadata } from 'next'
import VolunteerForm from '@/components/forms/VolunteerForm'

export const metadata: Metadata = {
  title: 'Volunteer with Us',
  description: 'Join the Bridge of Compassion volunteer team. Apply to volunteer and make a difference in your community.',
  alternates: { canonical: 'https://bridgeofcompassion.org/volunteer' },
}

export default function VolunteerPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-boc text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">Get Involved</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 text-balance tracking-tight">
            Volunteer with Us
          </h1>
          <p className="text-brand-warm-white/80 text-lg max-w-xl mx-auto">
            Your time and skills can make a real difference. Join our community of compassionate environmental stewards.
          </p>
        </div>
      </section>

      {/* Why volunteer */}
      <section className="section-py-sm bg-brand-sky/30 border-y border-border-soft/60">
        <div className="container-boc">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🌱', title: 'Make an Impact', text: 'Directly support outdoor education and practical conservation.' },
              { icon: '🤝', title: 'Grow Your Skills', text: 'Gain experience, build connections, and develop environmental leadership.' },
              { icon: '✨', title: 'Build Community', text: 'Join a dedicated team passionate about youth and the natural world.' },
            ].map((item) => (
              <div key={item.title} className="bg-brand-warm-white rounded-2xl p-6 shadow-card border border-border-soft">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-brand-navy mb-1">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-py bg-brand-warm-white">
        <div className="container-boc max-w-2xl">
          <h2 className="text-3xl font-extrabold text-brand-navy mb-2 text-center tracking-tight">Volunteer Application</h2>
          <p className="text-text-secondary text-center mb-8">
            Fill out the form below and a member of our team will be in touch.
          </p>
          <div className="bg-brand-warm-white rounded-2xl shadow-card p-6 sm:p-8 border border-border-soft">
            <VolunteerForm />
          </div>
        </div>
      </section>
    </>
  )
}
