import Container from '@/components/ui/Container'

interface ImpactTheme {
  id: string
  metric?: string // Optional for when verified numbers become available from the client
  title: string
  description: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
}

const impactThemes: ImpactTheme[] = [
  {
    id: 'outdoor-learning',
    title: 'Outdoor Learning',
    description: 'Helping young people learn through direct experiences with nature.',
    iconBg: 'bg-brand-green/20',
    iconColor: 'text-brand-leaf',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L6.5 11h3.5v7h4v-7h3.5L12 2zM4 19h16v2H4v-2z" />
      </svg>
    ),
  },
  {
    id: 'environmental-education',
    title: 'Environmental Education',
    description: 'Building practical knowledge for responsible environmental choices.',
    iconBg: 'bg-brand-cyan/20',
    iconColor: 'text-brand-cyan',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'community-action',
    title: 'Community Action',
    description: 'Turning environmental learning into meaningful local participation.',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-accent-orange',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'youth-leadership',
    title: 'Youth Leadership',
    description: 'Helping young people build confidence, responsibility, and leadership.',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-accent-pink',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

export default function ImpactStats() {
  return (
    <section
      className="section-py bg-brand-navy-dark text-brand-warm-white relative overflow-hidden"
      aria-labelledby="impact-heading"
    >
      {/* Subtle organic radial accents */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, #1FA7D8 0%, transparent 60%),
                            radial-gradient(circle at 85% 50%, #4F7F32 0%, transparent 60%)`,
        }}
      />

      <Container className="relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <span className="inline-block text-brand-cyan text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
            Our Purpose &amp; Impact
          </span>
          <h2
            id="impact-heading"
            className="text-brand-warm-white text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2.5 text-balance tracking-tight"
          >
            Empowering Youth, Protecting Nature
          </h2>
          <div className="w-12 h-1 bg-brand-green rounded-full mx-auto mb-2.5" />
          <p className="text-brand-warm-white/80 text-sm sm:text-base leading-relaxed">
            Connecting young people with the living world through experiential learning,
            practical conservation, and community stewardship.
          </p>
        </div>

        {/* 4-column qualitative impact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {impactThemes.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center p-4.5 sm:p-5 rounded-2xl bg-white/[0.06] border border-white/10
                         hover:bg-white/[0.1] hover:border-white/20 transition-all duration-200 group hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${item.iconBg} ${item.iconColor} mb-3 sm:mb-3.5 transition-transform duration-200 group-hover:scale-105`}>
                {item.icon}
              </div>

              {/* Optional future metric placeholder */}
              {item.metric && (
                <p className="text-2xl sm:text-3xl font-extrabold text-brand-warm-white mb-1.5">
                  {item.metric}
                </p>
              )}

              {/* Title */}
              <h3 className="text-brand-warm-white font-bold text-base mb-1.5">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-brand-warm-white/75 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </Container>
    </section>
  )
}
