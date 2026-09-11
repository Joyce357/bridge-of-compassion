import Container from '@/components/ui/Container'

const pillars = [
  {
    number: '01',
    title: 'We Lead with Compassion & Care',
    description:
      'Care for people and the natural world is our operating principle. Every programme, partnership, and decision is guided by long-term stewardship and genuine community connection.',
  },
  {
    number: '02',
    title: 'We Build Real Connections to Nature',
    description:
      'We create meaningful pathways for children, young people, and families to connect directly with ecosystems, practical conservation, and local environmental action.',
  },
  {
    number: '03',
    title: 'We Act with Integrity & Transparency',
    description:
      'Trust is built through accountability. We are transparent about our programmes, resource use, and community outcomes, holding ourselves to the highest standards.',
  },
  {
    number: '04',
    title: 'We Think Generations Ahead',
    description:
      'Environmental change requires sustainable roots. We design programmes and partnerships that cultivate lifelong environmental habits and generational impact.',
  },
]

export default function WhyBridge() {
  return (
    <section className="section-py bg-brand-sky/40 dark:bg-dark-surface border-y border-brand-sky/70 dark:border-dark-border transition-colors duration-200" aria-labelledby="why-bridge-heading">
      <Container>

        {/* Centered intro */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <span className="eyebrow">Why Bridge of Compassion</span>
          <h2
            id="why-bridge-heading"
            className="text-brand-navy dark:text-dark-text-primary text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-1.5 mb-2.5 text-balance tracking-tight"
          >
            A Nature-Led Approach to Community
          </h2>
          <div className="divider-green mx-auto mb-2.5" />
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm sm:text-base leading-relaxed">
            We believe that community wellbeing, youth empowerment, and ecological
            stewardship are deeply interconnected.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="relative p-5 sm:p-6 rounded-2xl bg-brand-warm-white dark:bg-dark-card border border-border-soft dark:border-dark-border
                         hover:border-brand-green/40 dark:hover:border-brand-cyan/40 hover:shadow-card transition-all duration-200"
            >
              {/* Number watermark */}
              <span className="text-5xl sm:text-6xl font-black text-brand-navy dark:text-brand-cyan opacity-10 dark:opacity-20 absolute top-4 right-5 leading-none select-none">
                {pillar.number}
              </span>
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-bold text-brand-navy dark:text-dark-text-primary mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>


      </Container>
    </section>
  )
}
