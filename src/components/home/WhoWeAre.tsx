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
    <section id="about" className="section-py bg-brand-warm-white dark:bg-dark-bg scroll-mt-16 transition-colors duration-200" aria-labelledby="who-we-are-heading">
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Content side */}
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              title="Grounded in Nature, Driven by Community"
              subtitle="Bridge of Compassion is an environmental nonprofit organization dedicated to fostering ecological stewardship, empowering youth leadership, and creating meaningful community action."
            />

            <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed mt-3.5 sm:mt-4 mb-5 sm:mb-6">
              We believe that lasting environmental change begins with education and connection.
              When young people experience the natural world firsthand, they develop the care,
              skills, and leadership needed to protect it. That is the bridge we are building.
            </p>

            {/* Values grid */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-3.5 mb-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-brand-warm-white dark:bg-dark-card border border-border-soft dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-cyan/40 hover:shadow-card transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-sage/40 dark:bg-dark-surface flex items-center justify-center text-base shrink-0">
                    <span role="img" aria-label={value.title}>
                      {value.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-brand-navy dark:text-dark-text-primary text-xs sm:text-sm font-bold mb-0.5">
                      {value.title}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary text-xs leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button href="/programs" variant="primary" size="md">
              Explore Our Programs
            </Button>
          </div>

          {/* Visual side */}
          <div className="relative">
            <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden aspect-4/3 sm:aspect-14/11 shadow-card border border-border-soft dark:border-dark-border bg-brand-cream dark:bg-dark-surface">
              <div className="img-placeholder w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-green/20 dark:bg-brand-cyan/20 flex items-center justify-center text-3xl mb-3">
                  🌳
                </div>
                <p className="font-bold text-brand-navy dark:text-dark-text-primary text-sm sm:text-base">
                  Connecting Youth &amp; Nature
                </p>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs mt-1 max-w-xs">
                  Hands-on workshops, tree planting, and local community stewardship in action.
                </p>
              </div>
            </div>

            {/* Floating purpose card */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-brand-navy dark:bg-dark-surface text-brand-warm-white dark:text-dark-text-primary px-5 py-4 rounded-xl sm:rounded-2xl shadow-xl max-w-[220px] sm:max-w-[240px] border border-brand-navy-dark dark:border-dark-border">
              <p className="text-brand-cyan text-[11px] font-bold tracking-widest uppercase mb-1">
                Our Purpose
              </p>
              <p className="text-brand-warm-white dark:text-dark-text-primary text-xs sm:text-sm font-medium leading-snug">
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
