import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'

const values = [
  {
    icon: '🌱',
    title: 'Outdoor Learning',
    description: 'We connect young people with nature through practical, hands-on outdoor education.',
  },
  {
    icon: '🤝',
    title: 'Community Action',
    description: 'Every project is rooted in collective responsibility and practical service.',
  },
  {
    icon: '🌳',
    title: 'Environmental Stewardship',
    description: 'We protect and restore ecosystems, plant trees, and care for biodiversity.',
  },
  {
    icon: '✨',
    title: 'Youth Leadership',
    description: 'Empowering young people to lead environmental initiatives in their communities.',
  },
]

export default function WhoWeAre() {
  return (
    <section id="about" className="section-py bg-brand-warm-white scroll-mt-16" aria-labelledby="who-we-are-heading">
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Content side */}
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              title="Grounded in Nature, Driven by Community"
              subtitle="Bridge of Compassion is an environmental nonprofit organization dedicated to fostering ecological stewardship, empowering youth leadership, and creating meaningful community action."
            />

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mt-3.5 sm:mt-4 mb-5 sm:mb-6">
              We believe that lasting environmental change begins with education and connection.
              When young people experience the natural world firsthand, they develop the care,
              skills, and leadership needed to protect it. That is the bridge we are building.
            </p>

            {/* Values grid */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-3.5 mb-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-brand-warm-white border border-border-soft hover:border-brand-green/40 hover:shadow-card transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-sage/40 flex items-center justify-center text-base shrink-0">
                    <span role="img" aria-label={value.title}>
                      {value.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-brand-navy text-xs sm:text-sm font-bold mb-0.5">
                      {value.title}
                    </h3>
                    <p className="text-text-secondary text-xs leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button href="/about" variant="primary" size="md">
              Learn More About Us
            </Button>
          </div>

          {/* Visual side with placeholder frame */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden img-placeholder shadow-card-hover border border-border-soft">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-sage/50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-brand-navy text-sm font-bold">Community In Action</p>
                  <p className="text-text-secondary text-xs mt-0.5">Hands-on conservation and outdoor learning</p>
                </div>
              </div>
            </div>

            {/* Floating purpose card */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-brand-navy text-brand-warm-white px-5 py-4 rounded-xl sm:rounded-2xl shadow-xl max-w-[220px] sm:max-w-[240px] border border-brand-navy-dark">
              <p className="text-brand-cyan text-[11px] font-bold tracking-widest uppercase mb-1">
                Our Purpose
              </p>
              <p className="text-brand-warm-white text-xs sm:text-sm font-medium leading-snug">
                Turning environmental knowledge into meaningful action.
              </p>
            </div>

            {/* Decorative soft accent elements */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-brand-sky/50 rounded-full opacity-40 -z-10" aria-hidden="true" />
            <div className="absolute top-6 -right-6 w-10 h-10 bg-brand-sage/50 rounded-full opacity-60 -z-10" aria-hidden="true" />
          </div>

        </div>
      </Container>
    </section>
  )
}
