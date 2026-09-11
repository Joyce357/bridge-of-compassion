interface SectionHeadingProps {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  titleClassName?: string
  className?: string
  light?: boolean  // for use on dark backgrounds
}

export default function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  titleClassName = '',
  className = '',
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  const titleColor = light ? 'text-brand-warm-white' : 'text-brand-navy dark:text-dark-text-primary'
  const subtitleColor = light ? 'text-brand-warm-white/80' : 'text-text-secondary dark:text-dark-text-secondary'

  return (
    <div id={id} className={`flex flex-col ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="eyebrow mb-2.5 sm:mb-3">{eyebrow}</span>
      )}
      <div className={align === 'center' ? 'flex flex-col items-center gap-2.5 sm:gap-3' : 'flex flex-col gap-2.5 sm:gap-3'}>
        <h2 className={`text-balance ${titleColor} ${titleClassName}`}>
          {title}
        </h2>
        <div className={`divider-green ${align === 'center' ? 'mx-auto' : ''}`} />
      </div>
      {subtitle && (
        <p className={`text-sm sm:text-base md:text-[17px] max-w-prose-lg leading-relaxed mt-3 sm:mt-3.5 ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
