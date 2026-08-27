interface BadgeProps {
  children: React.ReactNode
  variant?: 'cyan' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'soft' | 'outline'
  className?: string
}

export default function Badge({ children, variant = 'soft', className = '' }: BadgeProps) {
  const variants = {
    cyan:    'bg-brand-sky text-brand-navy border border-brand-cyan/20',
    blue:    'bg-brand-navy text-brand-warm-white',
    green:   'bg-brand-sage/60 text-brand-green border border-brand-green/20',
    orange:  'bg-amber-50 text-accent-orange border border-accent-orange/20',
    pink:    'bg-pink-50 text-accent-pink border border-accent-pink/20',
    purple:  'bg-purple-50 text-accent-purple border border-accent-purple/20',
    soft:    'bg-brand-sky/60 text-brand-navy border border-border-soft',
    outline: 'border border-border-soft text-text-secondary',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
