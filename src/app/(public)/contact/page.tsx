// ─── Contact Page ─────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/forms/ContactForm'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Bridge of Compassion. We would love to hear from you regarding environmental programs, volunteering, and community partnerships.',
  alternates: { canonical: 'https://bridgeofcompassion.org/contact' },
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy-dark dark:bg-dark-bg section-py text-brand-warm-white relative overflow-hidden transition-colors duration-200">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="container-boc text-center relative z-10">
          <p className="eyebrow text-brand-cyan mb-4">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-warm-white mb-4 text-balance tracking-tight">
            Contact Us
          </h1>
          <p className="text-brand-warm-white/80 text-lg max-w-xl mx-auto">
            Have a question, a partnership idea, or want to get involved with our environmental programs? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="section-py bg-brand-warm-white dark:bg-dark-bg transition-colors duration-200">
        <div className="container-boc">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Left: Form */}
            <div className="lg:col-span-3">
              <div className="bg-brand-warm-white dark:bg-dark-card rounded-2xl shadow-card border border-border-soft dark:border-dark-border p-6 sm:p-8 md:p-10">
                <h2 className="text-2xl font-extrabold text-brand-navy dark:text-dark-text-primary mb-6 tracking-tight">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-brand-warm-white dark:bg-dark-card rounded-2xl shadow-card border border-border-soft dark:border-dark-border p-6">
                <h3 className="font-bold text-brand-navy dark:text-dark-text-primary mb-4 text-lg">Other Ways to Reach Us</h3>
                <ul className="space-y-4 text-sm">
                  {settings.publicEmail && (
                    <li className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📧</span>
                      <div>
                        <p className="font-bold text-brand-navy dark:text-dark-text-primary">Email</p>
                        <p className="text-text-secondary dark:text-dark-text-secondary">
                          <a href={`mailto:${settings.publicEmail}`} className="hover:text-brand-green dark:hover:text-brand-cyan transition-colors">
                            {settings.publicEmail}
                          </a>
                        </p>
                      </div>
                    </li>
                  )}
                  {settings.phone && (
                    <li className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📞</span>
                      <div>
                        <p className="font-bold text-brand-navy dark:text-dark-text-primary">Phone</p>
                        <p className="text-text-secondary dark:text-dark-text-secondary">
                          <a href={`tel:${settings.phone}`} className="hover:text-brand-green dark:hover:text-brand-cyan transition-colors">
                            {settings.phone}
                          </a>
                        </p>
                      </div>
                    </li>
                  )}
                  {settings.publicLocationLabel && (
                    <li className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📍</span>
                      <div>
                        <p className="font-bold text-brand-navy dark:text-dark-text-primary">Location</p>
                        <p className="text-text-secondary dark:text-dark-text-secondary">{settings.publicLocationLabel}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-brand-sky/40 dark:bg-dark-surface rounded-2xl p-6 border border-brand-cyan/20 dark:border-dark-border">
                <h3 className="font-bold text-brand-navy dark:text-dark-text-primary mb-2">Looking to Volunteer?</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm mb-4 leading-relaxed">
                  If you want to volunteer, check out our volunteer opportunities and application form.
                </p>
                <Link
                  href="/volunteer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green dark:text-brand-cyan hover:text-brand-navy dark:hover:text-dark-text-primary transition-colors"
                >
                  Volunteer with us →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
