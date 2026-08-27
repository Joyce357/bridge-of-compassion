// ─── Donate Page ─────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import DonationForm from '@/components/forms/DonationForm'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Bridge of Compassion with a donation. Every dollar helps us protect ecosystems, educate youth, and strengthen community stewardship.',
  alternates: { canonical: 'https://bridgeofcompassion.org/donate' },
}

export default function DonatePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy-dark section-py text-brand-warm-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-boc text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">Support Our Mission</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 tracking-tight">Make a Donation</h1>
          <p className="text-brand-warm-white/80 text-lg max-w-xl mx-auto">
            Your generosity powers hands-on youth education, community tree planting, and local conservation initiatives.
          </p>
        </div>
      </section>

      {/* Donation form section */}
      <section className="section-py bg-brand-warm-white">
        <div className="container-boc">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft p-6 sm:p-8">
                <DonationForm />
              </div>
            </div>

            {/* Why donate */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">Your Environmental Impact</h2>

              {[
                { icon: '🌳', label: 'Tree Planting & Biodiversity', text: 'Funding native tree planting and urban conservation projects.' },
                { icon: '🎒', label: 'Outdoor Youth Education', text: 'Providing nature exploration workshops for children and students.' },
                { icon: '🤝', label: 'Community Action & Cleanups', text: 'Supplying equipment for volunteer conservation days.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 bg-brand-warm-white rounded-xl p-4 shadow-card border border-border-soft">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm">{item.label}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}

              <div className="bg-brand-sky/40 rounded-xl p-5 text-sm border border-brand-cyan/20">
                <p className="text-text-secondary">
                  <strong className="text-brand-navy">Questions about donating?</strong>{' '}
                  <a href="/contact" className="text-brand-green hover:text-brand-navy font-semibold underline">Contact us</a> and we will be happy to help.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
